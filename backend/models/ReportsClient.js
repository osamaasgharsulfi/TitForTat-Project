const mongoose = require("mongoose");

const ReportsClient = mongoose.Schema(
{
    client :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    },
    TotalJobs: {
        type: Number
    },
    TotalSpend: {
        type: Number
    }
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ReportsClient", ReportsClient);
