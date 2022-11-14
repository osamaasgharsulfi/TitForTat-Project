const mongoose = require("mongoose");

const ReportsFreelancer = mongoose.Schema(
{
    freelancer :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Freelancer',
    },
    TotalBlogs: {
        type: Number
    },
    TotalGigs: {
        type: Number
    },
    TotalOrders: {
        type: Number
    },
    TotalCompletedOrder: {
        type: Number
    },
    TotalRejectedOrder: {
        type: Number
    },
    TotalEarned: {
        type: Number
    },
    TotalExchangeSkills: {
        type: Number
    }

},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ReportsFreelancer", ReportsFreelancer);
