const mongoose = require("mongoose");
// const freelancer = require('./freelancerModel');

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    story: {
      type: String,
    },
    photo: {
      type: String,
    },
    freelancer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Freelancer",
      },
    ],
    Category: {
      type: String,
      enum: [
        "Development and Programming",
        "Graphic and Design",
        "Marketing",
        "Data Science",
        "Customer Support",
        "Writing and Translation",
      ],
    },
    comment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment",
      },
    ],
    RComments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reply_comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blogs", blogSchema);
