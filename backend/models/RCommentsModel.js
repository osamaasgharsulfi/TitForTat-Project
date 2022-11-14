const mongoose = require("mongoose");

const RCommentsSchema = mongoose.Schema(
  {
    Rcomment: {
      type: String
    },
    client_id: [{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Client"
    }],
    Blog_id: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "blog"
    }],
    Comment_id: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comments'
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("reply_comment",RCommentsSchema);
