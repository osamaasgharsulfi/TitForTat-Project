const { Schema, model } = require('mongoose')
const bcrypt = require("bcryptjs");

const adminSchema = new Schema({
    username:
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
    },
    password:
    {
        type: String,
        required: true
    },
    isAdmin:
    {
        type: Boolean,
        default: false
    },
})


adminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      const hash = await bcrypt.hash(this.password, 8);
      console.log(hash)
      this.password = hash;
    }
    next();
  });

  adminSchema.methods.comparePassword = async function (password) {
    const result = await bcrypt.compareSync(password, this.password);
    return result;
  };
module.exports = model('admin', adminSchema)
