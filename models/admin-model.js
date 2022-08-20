const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  uid: String,
  requests: [
    {
      username: { type: String },
      email: { type: String },
      name: { type: String },
      usertype: { type: String },
      phoneno: { type: String },
      companyname: { type: String },
      description: { type: String },
    },
  ],
  broadcastmessages: [{ type: String }],
  tags: [{ type: String }],
  targetgroups: [{ type: String }],
  themes: [{ type: String }],
});

module.exports = mongoose.model("ADMIN_MODEL", adminSchema, "admin-model");
