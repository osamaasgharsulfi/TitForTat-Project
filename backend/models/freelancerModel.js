const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const freelancerSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add first name"],
    },
    lastName: {
      type: String,
      required: [true, "Please add last name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    verified: { type: Boolean, default: false, required: true },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    phoneNumber: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    languages: {
      language: {
        type: String,
        enum: ["English", "Urdu"],
      },
      proficiency: {
        type: String,
        enum: ["Beginner", "Intermediate", "Fluent"],
      },
    },

    photo: {
      type: String,
    },
    address: {
      country: {
        type: String,
      },
      city: {
        type: String,
      },
      zipCode: {
        type: Number,
      },
      streetAddress: {
        type: String,
      },
    },
    Education: {
      degree: {
        type: String,
      },
      year: {
        type: String,
      },
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
    Title: {
      type: String,
    },
    Description: {
      type: String,
    },
    Skills: {
      skill: {
        type: String,
      },
      level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Expert"],
      },
    },
  },
  {
    timestamps: true,
  }
);

freelancerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, 8);
    this.password = hash;
  }
  next();
});
freelancerSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compareSync(password, this.password);
  return result;
};

module.exports = mongoose.model("Freelancer", freelancerSchema);