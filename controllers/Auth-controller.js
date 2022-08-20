const sellerModel = require("../models/seller-model");
const tokenService = require("../services/token-service");
class AuthController {
  async signUp(req, res) {
    const { username, usertype, password } = req.body;

    if (!username || !usertype || !password) {
      res.status(400).json({ message: " All fields required" });
      return;
    }
    let user;
    try {
      user = await sellerModel.findOne({ username: username });

      if (!user) {
        user = await sellerModel.create({
          username: username,
          usertype: usertype,
          password: password,
        });
      } else {
        res.status(400).send({ message: "User Exist" });
        return;
      }
    } catch (err) {
      res.status(500).json({ err });
      return;
    }
    const { accessToken, refreshToken } = tokenService.generateToken({
      _id: user._id,
      activated: false,
    });
    await tokenService.storeRefreshToken(refreshToken, user._id);
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = {
      username: user.username,
      usertype: user.usertype,
      unique_id: user._id,
    };
    res.json({ user: user, auth: true });
    return;
  }
  async login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: " All fields required" });
      return;
    }
    let user;
    try {
      user = await sellerModel.findOne({ username: username });

      if (!user) {
        res.status(400).send({ message: "User doesn't exist " });
        return;
      }
      if (password !== user.password) {
        res.status(400).send({ message: "Wrong Password" });
        return;
      }
    } catch (err) {
      res.status(500).json({ err });
      return;
    }
    const { accessToken, refreshToken } = tokenService.generateToken({
      _id: user._id,
      activated: false,
    });
    await tokenService.storeRefreshToken(refreshToken, user._id);

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = {
      username: user.username,
      email: user?.email,
      name: user?.name,
      usertype: user.usertype,
      unique_id: user._id,
      phoneno: user?.phoneno,
      companyname: user?.companyname,
    };
    res.json({ user: userDto, auth: true });
    return;
  }
  async refresh(req, res) {
    // get refresh token from cookie
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    // check if token is valid
    let userData;
    try {
      userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
    } catch (err) {
      return res.status(401).json({ message: "Invalid Token 1" });
    }
    try {
      const token = await tokenService.findRefreshToken(
        userData._id,
        refreshTokenFromCookie
      );
      if (!token) {
        return res.status(401).json({ message: "Invalid token 2" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Internal Error" });
    }
    // check if valid user
    const user = await sellerModel.find({ _id: userData._id });
    if (!user) {
      return res.status(404).json({ message: "No user" });
    }
    // generate new token
    const { refreshToken, accessToken } = await tokenService.generateToken({
      _id: userData._id,
    });
    //update token
    try {
      await tokenService.updateRefreshToken(userData._id, refreshToken);
    } catch (err) {
      return res.status(500).json({ message: "Internal Error" });
    }
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });
    // response
    const userDto = {
      username: user[0].username,
      usertype: user[0].usertype,
      unique_id: user[0]._id,
      email: user[0]?.email,
      name: user[0]?.name,
      phoneno: user[0]?.phoneno,
      companyname: user[0]?.companyname,
    };

    res.json({ user: userDto, auth: true });
    return;
  }
  async logout(req, res) {
    // delete refresh token fron db
    const { refreshToken } = req.cookies;
    await tokenService.removeToken(refreshToken);
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.json({ user: null, auth: false });
    //delete cookies
    return;
  }
}
module.exports = new AuthController();
