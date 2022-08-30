const sellerModel = require("../models/seller-model");

class UserServices {
  async findexistinguser(username) {
    let user;
    try {
      user = await sellerModel.findOne({ username: username });
      if (user) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}

module.exports = new UserServices();
