const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const CommentSchema = new mongoose.Schema({
  commentId: {
    type: Number,
    // required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  commentDate: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    // required: true,
  },
  userImage: {
    type: String,
  },
  postId: {
    type: Number,
    required: true,
  },
});

CommentSchema.plugin(AutoIncrement, { inc_field: 'commentId' });
module.exports = mongoose.model('Comment', CommentSchema);
