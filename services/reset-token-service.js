const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const resetTokenModel = require("../models/reset-token-model");
dotenv.config();
const JWT_RESET = process.env.JWT_RESET_TOKEN;
class ResetToken {
  generateResetToken(payload) {
    let token = jwt.sign(payload, JWT_RESET, {
      expiresIn: "720m",
    });
    return token;
  }
  verfiyResetToken(token) {
    return jwt.verify(token, JWT_RESET);
  }
  async storeResetToken(token) {
    try {
      await resetTokenModel.create({ token });
    } catch (err) {
      console.log(err);
    }
  }
  async findResetToken(token) {
    return await resetTokenModel.findOne({
      token: token,
    });
  }
  async removeResetToken(token) {
    return await resetTokenModel.deleteOne({ token: token });
  }
}
module.exports = new ResetToken();
