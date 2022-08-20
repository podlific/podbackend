const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagsSchema = new Schema({
  tagName: String,
  podcastId: [{ podId: String }],
});

module.exports = mongoose.model("TAGS_MODEL", tagsSchema, "tags-schema");
