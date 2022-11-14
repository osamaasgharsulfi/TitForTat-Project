const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const proposal = mongoose.Schema(
  {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
    },
    exchangeSkillsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exchangeSkills",
    },
    bid: {
      type: Number,
      required: [true, "Please add  Bid"],
    },
    duration: {
      type: Number,
      required: [true, "Please add duration"],
    },
    coverLetter: {
      type: String,
      required: [true, "Please add Cover Letter"],
    },
    recentExperience: {
      type: String,
      required: ["Please add Your Recent Experience With similar projects"],
    },
    socialMediaLinks: [
      {
        type: String,
      },
    ],
    attachment: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
    updated: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("proposal", proposal);
