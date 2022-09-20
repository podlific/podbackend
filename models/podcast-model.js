const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const podcastSchema = new Schema(
  {
    image: String,
    sellerId: String,
    sellerUserName: String,
    sellername: String,
    episodeName: String,
    podcastName: String,
    tags: [(type = String)],
    theme: [(type = String)],
    groups: [(type = String)],
    episodes: [
      { id: Number, epi_no: String, epi_name: String, epi_duration: String },
    ],
    description: String,
    averageListener: String,
    averageEpisodeLength: String,
    averageLTR: String,
    releaseFrequency: String,
    bookings: [{ date: String, time: String }],
    requestedtags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

module.exports = mongoose.model(
  "PODCAST_MODEL",
  podcastSchema,
  "podcast-schema"
);
