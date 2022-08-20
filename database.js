const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
function DbConnect() {
  const DB_URL = process.env.DB_URL;
  // Database connection
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("DB connected...");
  });
}

module.exports = DbConnect;
