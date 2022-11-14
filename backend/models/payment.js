const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const paymentModel = mongoose.Schema(
{
    CardDetails :{
            name : {
                type : String 
            },
            email :{
                type : String 
            },
            customerId : {
                type : String 
            },
            cardId :{
                type : String 
            }
    },
    userId :{
      type: mongoose.Schema.Types.ObjectId,
    },
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("paymentModel", paymentModel);
