const { Schema, model } = require("mongoose");

const contractSchema = new Schema(
  {
    sender: {
      type: String,
      required: true
    },
    contractAddress:{
        type: String,
        required: true
    },
    arbiter: {
      type: String,
    },  

    beneficiary: {
      type: String,
      required: true,
    },

    amount:{
        type: String,
        required: true
    },
    status: {
        type: String,
        required: false,
        default: "Pending",
        enum: ["Approved", "Pending", "Failed"]
    }

  }, 
  {
    timestamps: true,
  }
);

const Contract = model("Contract", contractSchema);

module.exports = Contract;