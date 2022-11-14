const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    comment: {
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comment", commentSchema);
