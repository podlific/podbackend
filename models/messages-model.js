const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const message = new Schema({
  message: [
    {
      text: { type: String },
      from: { type: mongoose.Schema.Types.ObjectId },
      to: { type: mongoose.Schema.Types.ObjectId },
    },
  ],
  isUpdated: { type: Boolean },
});
module.exports = mongoose.model("message", message, "message-model");
