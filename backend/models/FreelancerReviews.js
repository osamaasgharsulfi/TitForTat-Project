const mongoose = require("mongoose");

const ReviewModel = mongoose.Schema(
{
    OrderId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderModel',
    },
    ClientId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    },
    Ratings: {
        type: Number
    },
    Review: {
        type: String
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Freelancer'
    }

},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FreelancerReviews", ReviewModel);
