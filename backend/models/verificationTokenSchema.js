const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const verificationTokenSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

verificationTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const hash = await bcrypt.hash(this.token, 8);
    this.token = hash;
  }
  next();
});
verificationTokenSchema.methods.compareToken = async function (token) {
  const result = await bcrypt.compareSync(token, this.token);
  return result;
};

module.exports = mongoose.model("VerificationToken", verificationTokenSchema);
