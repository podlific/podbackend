const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const resetSchema = new Schema(
  {
    token: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reset", resetSchema, "reset-tokens");
