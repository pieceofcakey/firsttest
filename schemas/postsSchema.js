const mongoose = require('mongoose');

const AutoIncrement = require('mongoose-sequence')(mongoose);

const PostSchema = new mongoose.Schema({
  postId: {
    type: Number,
    // required: true,
  },
  postTitle: {
    type: String,
    required: true,
  },
  thumbnailImage: {
    type: String,
  },
  postContentMd: {
    type: String,
    required: true,
  },
  postContent: {
    type: String,
    required: true,
  },
  postDate: {
    type: String,
    required: true,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  nickname: {
    type: String,
    // required: true,
  },
  userImage: {
    type: String,
  },
});

PostSchema.plugin(AutoIncrement, { inc_field: 'postId' });
module.exports = mongoose.model('Post', PostSchema);
