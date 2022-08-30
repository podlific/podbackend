const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sellerSchema = new Schema(
  {
    username: { type: String, required: true },
    usertype: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String },
    name: { type: String },
    companyname: { type: String },
    phoneno: { type: String },
    connected: [{ type: mongoose.Schema.Types.ObjectId }],
    messages: [
      {
        message: String,
        from: String,
        to: String,
        date: String,
        time: String,
        seen: String,
        request: String,
        podcastid: String,
        SelectedDate: String,
        SelectedTime: String,
      },
    ],
    podcast: [{ type: String }],
    chats: [
      {
        connectedUser: { type: mongoose.Schema.Types.ObjectId },
        chatId: { type: mongoose.Schema.Types.ObjectId },
      },
    ],
    requests: [
      {
        podcastid: { type: String },
        podcastname: { type: String },
        date: { type: String },
        time: { type: String },
        sellername: { type: String },
        sellerusername: { type: String },
        sellerid: { type: String },
        buyerid: { type: String },
        buyername: { type: String },
        buyerusername: { type: String },
        client: { type: String },
        product: { type: String },
        targetgroup: { type: String },
        addtargetgroup: { type: String },
        description: { type: String },
        confirmed: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

module.exports = mongoose.model("SELLER_MODEL", sellerSchema, "seller-model");
