const jwt = require("jsonwebtoken");
const refreshModel = require("../models/refresh-model");
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
class TokenService {
  generateToken(payload) {
    const accessToken = jwt.sign(payload, "asdnasdfsdfknsdna", {
      expiresIn: "1m",
    });
    const refreshToken = jwt.sign(payload, "asjdaksdfsadsdbk", {
      expiresIn: "1y",
    });

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(token, userId) {
    try {
      await refreshModel.create({
        token,
        userId,
      });
    } catch (err) {
      // //console.log(err);
    }
  }

  async verifyAccessToken(token) {
    return jwt.verify(token, "asdnasdfsdfknsdna");
  }
  async verifyRefreshToken(refreshToken) {
    return jwt.verify(refreshToken, "asjdaksdfsadsdbk");
  }
  async findRefreshToken(userId, refreshToken) {
    return await refreshModel.findOne({
      userId: userId,
      token: refreshToken,
    });
  }
  async updateRefreshToken(userId, refreshToken) {
    return await refreshModel.updateOne(
      { userId: userId },
      { token: refreshToken }
    );
  }
  async removeToken(refreshToken) {
    return await refreshModel.deleteOne({ token: refreshToken });
  }
}
module.exports = new TokenService();
