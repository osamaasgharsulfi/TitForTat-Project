const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const exchangeSkills = mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
    },
    title: {
      type: String,
      required: [true, "Please add  title"],
    },
    discription: {
      type: String,
      required: [true, "Please add discription"],
    },
    duration: {
      type: Number,
      required: [true, "Please add duration"],
    },

    offeredSkills: {
      type: String,
      required: ["Please add offered Skills"],
    },
    requiredSkills: {
      type: String,
      required: ["Please add required Skills"],
    },

    price: {
      beginnerLevel: {
        type: Number,
      },
      intermediate: {
        type: Number,
      },
      expert: {
        type: Number,
      },
    },
    tags: [
      {
        type: String,
        required: ["Please add atleast One Tag"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("exchangeSkills", exchangeSkills);
