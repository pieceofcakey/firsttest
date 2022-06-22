const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Post = require('../schemas/postsSchema');
const Comment = require('../schemas/commentsSchema');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const { markdownToTxt } = require('markdown-to-txt');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'jerryjudymary',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '.' + file.originalname.split('.').pop()); // 이름 설정
    },
  }),
});

// 이미지 업로드 - 미리보기용 url 응답

router.post(
  '/images',
  // authMiddleware,
  upload.single('postImage'),
  async (req, res) => {
    try {
      const postImage = req.file.location;
      res.status(200).json({ success: true, postImage });
    } catch (err) {
      res.status(500).send({ result: 'fail' });
    }
  }
);

// 게시글 작성

router.post('/', authMiddleware, async (req, res) => {
  console.log(res.locals.user);
  const now = new Date();
  const date = now.toLocaleDateString('ko-KR');
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const postDate = date + ' ' + hours + ':' + minutes;
  const { nickname, userImage } = res.locals.user;
  const { postTitle, postContentMd } = req.body;
  const postContent = markdownToTxt(postContentMd);

  let thumbnailImage;

  if (postContentMd.includes('](https://') !== false) {
    thumbnailImage = postContentMd.substring(
      postContentMd.indexOf('](https://') + 2,
      postContentMd.indexOf(')')
    );
  } else {
    thumbnailImage =
      process.env.DEFAULT_THUMBNAIL_IMG +
      'defaultpostImage1228368893321736193.jpg';
  }

  const post = await Post.create({
    postTitle,
    postContentMd,
    nickname,
    postDate,
    thumbnailImage,
    userImage,
    postContent,
  });

  res.status(200).json({ success: true, post });
});

// 복수의 url 배열 저장용

/* -- postImage에 각 파일의 location을 배열로 넣어줌 --
    const postImageArray = req.files;
    let blankImageArray = [];

    function LocationPusher() { for (let i = 0; i < postImageArray.length; i++) {
        blankImageArray.push(postImageArray[i].location)
    } return blankImageArray
  }
    const postImage = LocationPusher()


    // -------------------------------------------------- */

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

router.put('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const user = res.locals.user;
  const nickname = user.nickname;
  const { postTitle, postContentMd } = req.body;
  const postContent = markdownToTxt(postContentMd);
  const existPost = await Post.findOne({ postId: postId });

  let thumbnailImage;

  if (postContentMd.includes('](https://') !== false) {
    thumbnailImage = postContentMd.substring(
      postContentMd.indexOf('](https://') + 2,
      postContentMd.indexOf(')')
    );
  } else {
    thumbnailImage =
      process.env.DEFAULT_THUMBNAIL_IMG +
      'defaultpostImage1228368893321736193.jpg';
  }

  if (nickname === existPost.nickname) {
    if (existPost) {
      await Post.updateOne(
        { postId: postId },
        { $set: { postTitle, postContentMd, thumbnailImage, postContent } }
      );
      res.status(200).json({
        result: 'success',
        postTitle,
        postContentMd,
        thumbnailImage,
        postContent,
      });
    } else {
      res.status(400).send({ result: 'fail' });
    }
  } else {
    res.status(400).send({ result: 'fail' });
  }
});

module.exports = router;
