const Client = require("../models/clientModel");
const ResetPasswordToken = require("../models/resetPasswordToken");
const { isValidObjectId } = require("mongoose");

exports.isResetTokenValid = async (req, res, next) => {
  const { token, id } = req.query;
  if (!token || !id) {
    res.json({
      errorMessage: "Invalid Request ",
    });
  }

  if (!isValidObjectId(id)) {
    res.json({
      errorMessage: "Invalid Client ",
    });
  }

  const client = await Client.findById(id);
  if (!client) {
    res.json({
      errorMessage: "client not found!",
    });
  }
  const resetToken = await ResetPasswordToken.findOne({ owner: client._id });
  if (!resetToken) {
    res.json({
      errorMessage: "Reset token not found! ",
    });
  }

  console.log(resetToken);
  const isValid = await resetToken.compareToken(token);
  if (isValid) {
    res.json({
      successMessage: "Reset token is valid!",
    });
  }
  req.client = client;
  next();
};
