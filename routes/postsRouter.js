const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Post = require('../schemas/postsSchema');
const Comment = require('../schemas/commentsSchema');
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: 'static/',
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './static');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
    fileFilter: (req, file, cb) => {
      if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype))
        cd(null, true);
      else cd(Error('PNG, jpeg만 업로드 하세요'), false);
    },
    limits: {
      fileSize: 1024 * 1024,
    },
  }),
});
// 게시물 작성
// upload.single('postImage')에서 'image'는 변수명
// auth추가
// router.post("/", upload.single(postImage), async(req, res) => { //posts
//     console.log(req.file)
//     // req.file내에는 fieldname, originalname,
//     //encoding, destination, filename 등의 정보가 저장
//     // 저장 성공시 asw s3 버킷에 저장
//     const postImage = req.file.location;
//     const createdAt = new Date().toLocaleString()
//     // const { user } = res.locals.user
//     // const userId = user["userId"]
//     const userId = "TEST입니다"
//     const { title, content, nickName} = req.body; // userId 추가해야합니다.
//     console.log(postId);
//     await Post.create({ title, content, nickName, postImage, userId, createdAt });

//     res.json({ success: "msg"})

// });

// 게시물작성
router.post(
  '/',
  authMiddleware,
  upload.single('postImage'),
  async (req, res) => {
    console.log(req.body);
    console.log(req.file);

    const now = new Date();
    const date = now.toLocaleDateString('ko-KR');
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const postDate = date + ' ' + hours + ':' + minutes;
    const { nickname, userImage } = res.locals.user;
    const { postTitle, postContent } = req.body;
    const postImage = 'http://3.35.170.203/' + req.file.filename;

    await Post.create({
      postTitle,
      postContent,
      nickname,
      postDate,
      postImage,
      userImage,
    });

    res.status(200).json({ success: true, postImage });
  }
);

//전체 게시물 조회
router.get('/', async (req, res) => {
  const post = await Post.find().sort({ postId: -1 });
  res.send({ post });
});

//상세 페이지 조회
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findOne({ postId: postId });
  const comments = await Comment.find({ postId: postId }).sort({
    commentId: -1,
  });
  res.status(200).json({ post, comments });
});

//게시글 삭제
router.delete('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const user = res.locals.user;

  const nickname = user.nickname;
  const existPost = await Post.findOne({ postId: parseInt(postId) });
  const existComment = await Comment.find({ postId: parseInt(postId) });
  console.log('코멘트입니다:', existComment);
  console.log(nickname);
  console.log(existPost.nickname);

  if (nickname === existPost.nickname) {
    if (existPost && existComment) {
      await Post.deleteOne({ postId: parseInt(postId) });
      await Comment.deleteMany({ postId: parseInt(postId) });
      res.send({ result: 'success' });
    } else if (existPost) {
      await Post.deleteOne({ postId: parseInt(postId) });
      res.status(200).send({ result: 'success' });
    }
  } else {
    res.status(401).send({ result: 'fail' });
  }
});

// 게시글 수정
router.put(
  '/:postId',
  authMiddleware,
  upload.single('postImage'),
  async (req, res) => {
    ///posts/:postId
    const { postId } = req.params;
    const user = res.locals.user;
    const nickname = user.nickname;
    const { postTitle, postContent } = req.body;
    const existPost = await Post.findOne({ postId: postId });
    const postImage = 'http://3.35.170.203/' + req.file.filename;
    console.log(req.file);
    if (nickname === existPost.nickname) {
      if (existPost) {
        await Post.updateOne(
          { postId: postId },
          { $set: { postTitle, postContent, postImage } }
        );
        res.status(200).json({ result: 'success', postImage });
      } else {
        res.status(400).send({ result: 'fail' });
      }
    } else {
      res.status(400).send({ result: 'fail' });
    }
  }
);

module.exports = router;
