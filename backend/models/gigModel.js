const mongoose = require("mongoose");
// const freelancer = require('./freelancerModel');

const gigSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: ["I will develop website for in two days"],
    },
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
    skills: [
      {
        type: String,
        required: ["Skills are Required"],
      },
    ],
    freelancer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Freelancer",
      },
    ],
    BASIC: {
      name: {
        type: String,
      },
      details: {
        type: String,
      },
      time: {
        type: String,
      },
      revisions: {
        type: Number,
      },
      Price: {
        type: Number,
      },
    },
    STANDARD: {
      name: {
        type: String,
      },
      details: {
        type: String,
      },
      time: {
        type: String,
      },
      revisions: {
        type: Number,
      },
      Price: {
        type: Number,
      },
    },
    PREMIUM: {
      name: {
        type: String,
      },
      details: {
        type: String,
      },
      time: {
        type: String,
      },
      revisions: {
        type: Number,
      },
      Price: {
        type: Number,
      },
    },
    description: {
      type: String,
      required: [true, "briefly descibe your gig"],
    },
    requirements: {
      type: String,
      required: [true, "tell your buyer what you need to get started"],
    },
    attachments: {
      type: String,
    },
    selectPackage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GIGS", gigSchema);
