const Freelancer = require("../models/freelancerModel");
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
      errorMessage: "Invalid freelancer ",
    });
  }

  const freelancer = await Freelancer.findById(id);
  if (!freelancer) {
    res.json({
      errorMessage: "freelancer not found!",
    });
  }
  const resetToken = await ResetPasswordToken.findOne({
    owner: freelancer._id,
  });
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
  req.freelancer = freelancer;
  next();
};
