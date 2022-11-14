const mongoose = require("mongoose");

const ReviewModel = mongoose.Schema(
{
    OrderId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderModel',
    },
    freelancer :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Freelancer',
    },
    Ratings: {
        type: Number
    },
    Review: {
        type: String
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    }

},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ClientReviews", ReviewModel);
