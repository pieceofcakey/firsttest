const router = require('express').Router();
const Post = require('../schemas/postsSchema');
const Comment = require('../schemas/commentsSchema');
const User = require('../schemas/usersSchema');
const authMiddleware = require('../middlewares/authMiddleware');

// 코멘트 작성: 유저확인
router.post('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { nickname } = res.locals.user;
  const { comment } = req.body;

  const existingUser = await User.findOne({ nickname: nickname });
  const userImage = existingUser.userImage;

  const now = new Date();
  const date = now.toLocaleDateString('ko-KR');
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const commentDate = date + ' ' + hours + ':' + minutes;

  if (!comment) {
    res.status(400).json({ success: false, message: '내용을 입력하세요' });
  }
  const createdComment = await Comment.create({
    comment,
    commentDate,
    nickname,
    userImage,
    postId,
  });
  const commentCount = await Comment.find({ postId: parseInt(postId) });
  await Post.updateOne(
    { postId: parseInt(postId) },
    { $set: { commentCount: commentCount.length } }
  );
  res.status(200).json({
    success: true,
    message: '댓글 저장 성공',
    comment: createdComment,
  });
});

// 코멘트 삭제: 유저확인
router.delete('/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { nickname } = res.locals.user;
  const existingComment = await Comment.findOne({
    commentId: commentId,
  });

  if (nickname !== existingComment.nickname) {
    res
      .status(400)
      .json({ success: false, message: '내가 쓴 댓글이 아닙니다' });
  } else {
    await Comment.deleteOne({ commentId: parseInt(commentId) });
    const commentCount = await Comment.find({
      postId: existingComment.postId,
    });
    await Post.updateOne(
      { postId: existingComment.postId },
      { $set: { commentCount: commentCount.length } }
    );
    res.status(200).json({ success: true, message: '댓글 삭제 성공' });
  }
});

// 코멘트 수정: 유저확인
router.put('/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { nickname } = res.locals.user;
  const { comment } = req.body;
  const existingComment = await Comment.findOne({ commentId: commentId });

  if (nickname !== existingComment.nickname) {
    res
      .status(400)
      .json({ success: false, message: '내가 쓴 댓글이 아닙니다' });
  } else {
    await Comment.updateOne(
      { commentId: parseInt(commentId) },
      { $set: { comment } }
    );
    res.status(200).json({ success: true, message: '댓글 수정 완료' });
  }
});

module.exports = router;
