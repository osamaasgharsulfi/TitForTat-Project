const mongoose = require("mongoose");


const notifySchema = mongoose.Schema(
  {
    title: { type: String,   required: true },
    
    context: { type: String, required: true },
    
    sendto: {type: mongoose.Schema.Types.ObjectId , ref: 'Freelancer' },

    sendfrom: {type: mongoose.Schema.Types.ObjectId, ref: 'Client' },

    id: {type: mongoose.Schema.Types.ObjectId }

  },{
    timestamps: true,
  }
);

module.exports = mongoose.model("Notifications", notifySchema);
