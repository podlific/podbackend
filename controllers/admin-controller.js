const adminModel = require("../models/admin-model");
const sellerModel = require("../models/seller-model");
const nodemailer = require("nodemailer");
const resetTokenService = require("../services/reset-token-service");
const { sendMail } = require("../services/mailling-service");
const { findexistinguser } = require("../services/user-services");
const tagsModel = require("../models/tags-model");
const podcastModel = require("../models/podcast-model");
class AdminController {
  async getAdminData(req, res) {
    let count = await adminModel.collection.countDocuments();
    if (count === 1) {
      let info = await adminModel.find({ uid: "#adminmodel123" });
      if (info) {
        res.status(200).send(info);
        return;
      }
    }
    if (count === 0) {
      let info1 = await adminModel.create({
        uid: "#adminmodel123",
        requests: [],
        tags: [],
        targetgroups: [],
        themes: [],
        admintags: [],
      });
      if (info1) {
        res.status(200).send(info1);
        return;
      }
    }

    res.status(400).send({ message: "New admin model not created" });
    return;
  }
  async addNewUsertoRequest(req, res) {
    let info = await adminModel.find({ uid: "#adminmodel123" });
    if (!info) {
      res.status(400).send({ message: "Unable to send Request" });
      return;
    }
    let { username, email, usertype, name, phoneno, companyname, description } =
      req.body;
    let newdata = {
      username: username,
      email: email,
      name: name,
      usertype: usertype,
      phoneno: phoneno,
      companyname: companyname,
      description: description,
    };

    let uid = "#adminmodel123";
    info = await adminModel.findOneAndUpdate(uid, {
      $push: { requests: newdata },
    });
    if (info) {
      res.status(200).send({ message: "Request sent Successfully" });
      return;
    }
    res.status(400).send({ message: "Request not added " });
    return;
  }
  async getalluserforadmin(req, res) {
    let info = await sellerModel.find({});
    if (!info) {
      res.status(400).send({ message: "Unable to get data " });
      return;
    }
    res.status(200).send(info);
    return;
  }
  async createNewUserAccount(req, res) {
    const { username, usertype, email, companyname, name, phoneno } = req.body;
    let min = 1000000,
      max = 9000000;
    let password = Math.floor(Math.random() * min) + max;
    password = password.toString();
    if ((!username, !usertype, !email, !companyname, !name, !phoneno)) return;
    let user = await sellerModel.create({
      username: username,
      usertype: usertype,
      password: password,
      email: email,
      companyname: companyname,
      name: name,
      phoneno: phoneno,
    });
    if (!user) {
      res.status(400).send({ message: " New user not created" });
      return;
    }
    let info = await adminModel.find({ uid: "#adminmodel123" });
    if (!info) {
      res
        .status(400)
        .send({ message: "Unable to update Request in Admin data" });
      return;
    }
    let requests = [];
    for (let i = 0; i < info[0].requests.length; i++) {
      if (info[0].requests[i].username !== username) {
        requests.push(info[0].requests[i]);
      }
    }
    let uid = "#adminmodel123";
    info = await adminModel.findOneAndUpdate(uid, {
      requests: requests,
    });
    if (!info) {
      res.status(400).send({ message: "Request not updated in database" });
      return;
    }
    let token = await resetTokenService.generateResetToken({ email: email });
    try {
      await resetTokenService.storeResetToken(token);
    } catch (err) {
      res.status(400).send({ message: "Request not updated in database" });
      return;
    }

    let info1 = await sendMail(email, token, 1);
    if (!info1) {
      res.status(400).send({ message: "Email not sent " });
      return;
    }
    res.status(200).send({ message: "Email sent sucessfully" });
    return;
  }
  async deleteuserrequest(req, res) {
    const { username } = req.body;
    if (!username) return;
    let info = await adminModel.find({ uid: "#adminmodel123" });
    if (!info) {
      res
        .status(400)
        .send({ message: "Unable to update Request in Admin data" });
      return;
    }
    let requests = [];
    for (let i = 0; i < info[0].requests.length; i++) {
      if (info[0].requests[i].username !== username) {
        requests.push(info[0].requests[i]);
      }
    }
    let uid = "#adminmodel123";
    info = await adminModel.findOneAndUpdate(uid, {
      requests: requests,
    });
    if (!info) {
      res.status(400).send({ message: "Request not updated in database" });
      return;
    }
    res.status(200).send({ message: "User removed successfully" });
  }
  async addbrocasttext(req, res) {
    const { text } = req.body;
    let info = await adminModel.find({ uid: "#adminmodel123" });
    if (!info) {
      res.status(400).send({ message: "Unable to Broadcast Message" });
      return;
    }
    let uid = "#adminmodel123";
    try {
      info = await adminModel.findOneAndUpdate(uid, {
        $push: { broadcastmessages: text },
      });
      if (info) {
        res.status(200).send({ message: " Message Broadcasted Successfully" });
        return;
      }
    } catch (err) {
      res.status(400).send({ message: "Unable to Broadcast Message" });
      return;
    }
    res.status(400).send({ message: "Unable to Broadcast Message" });
    return;
  }
  async adddatausingcsv(req, res) {
    const { csvData } = req.body;
    const makeNewAccounts = async (data) => {
      let min = 1000000,
        max = 9000000;
      let password = Math.floor(Math.random() * min) + max;
      password = password.toString();
      if (!data.username || !data.usertype || !data.email) {
        return [];
      }
      let userExist;
      try {
        userExist = await sellerModel.findOne({ username: data.username });
      } catch (err) {}
      if (userExist) {
        return [];
      }
      let user;
      try {
        user = await sellerModel.create({
          username: data.username,
          usertype: data.usertype,
          password: password,
          email: data?.email,
          companyname: data?.companyname,
          name: data?.name,
          phoneno: data?.phoneno,
        });
      } catch (err) {
        return [];
      }
      let token = await resetTokenService.generateResetToken({
        email: data.email,
      });
      try {
        await resetTokenService.storeResetToken(token);
      } catch (err) {
        res.status(400).send({ message: "Request not updated in database" });
        return;
      }
      await sendMail(data.email, token, 1);
      return user;
    };
    const fetchCSVdataInfo = async (data) => {
      if (!data) {
        res.status(400).send({ message: "Request not updated in database" });
        return;
      }
      const requests = data.map((ele) => {
        return makeNewAccounts(ele).then((a) => {
          return a;
        });
      });
      return await Promise.all(requests);
    };
    const uploadData = await fetchCSVdataInfo(csvData).then((a) => {
      return a;
    });
    res.status(200).send(uploadData);
  }
  async updateadmintags(req, res) {
    const { themes, tags, targetgroups } = req.body;
    let uid = "#adminmodel123";
    let info = await adminModel.findOneAndUpdate(uid, {
      tags: tags,
      themes: themes,
      targetgroups: targetgroups,
    });
    if (info) {
      res.status(200).send({ message: "All tags are updated " });
      return;
    }
    res.status(400).send({ message: "Tags not updated" });
  }
  async sendinfoforuser(req, res) {
    const { uid } = req.body;
    let info = await adminModel.find({ uid: "#adminmodel123" });
    if (!info) {
      res.status(400).send({ message: "Unable to get Data" });
    }
    let len = info[0].broadcastmessages.length;
    let broadcastmessages = info[0].broadcastmessages[len - 1];
    let data = {
      broadcastmessages: broadcastmessages,
      tags: info[0].tags,
      themes: info[0].themes,
      groups: info[0].targetgroups,
    };
    res.status(200).send(data);
  }
  async setnewpassword(req, res) {
    const { token, password } = req.body;
    let decoded;
    try {
      decoded = await resetTokenService.verfiyResetToken(token);
    } catch (err) {
      res.status(400).send({ message: "Unable to update password" });
      return;
    }
    try {
      let savedToken = await resetTokenService.findResetToken(token);
      if (!savedToken) {
        res
          .status(400)
          .send({ message: "Password already reset please try logging " });
        return;
      }
    } catch (err) {
      res
        .status(400)
        .send({ message: "Password already reset please try logging " });
      return;
    }
    try {
      let savedToken = await resetTokenService.removeResetToken(token);
      if (!savedToken) {
        res
          .status(400)
          .send({ message: "Password already reset please try logging " });
        return;
      }
    } catch (err) {
      res
        .status(400)
        .send({ message: "Password already reset please try logging " });
      return;
    }

    let email = decoded.email;
    try {
      let user = await sellerModel.findOneAndUpdate(
        { email: email },
        {
          password: password,
        }
      );
    } catch (err) {
      res.status(400).send({ message: "Unable to set Password , try again " });
      return;
    }

    res.status(200).send({ message: "Password updated" });
  }
  async resetpassword(req, res) {
    const { mail } = req.body;
    let user = await findexistinguser(mail);
    if (!user) {
      res.status(400).send({ message: "User doesn't exist first signup" });
      return;
    }
    let token = await resetTokenService.generateResetToken({ email: mail });
    try {
      await resetTokenService.storeResetToken(token);
    } catch (err) {
      res.status(400).send({ message: "Request not updated in database" });
      return;
    }

    let info1 = await sendMail(mail, token, 2);
    if (!info1) {
      res.status(400).send({ message: "Email not sent " });
      return;
    }
    res.status(200).send({ message: "Email sent sucessfully" });
    return;
  }
  async gettagdata(req, res) {
    try {
      let info = await tagsModel.find({});
      return res.status(200).send(info);
    } catch (err) {
      res.status(400).send({ message: "Unable to get Tag data" });
      return;
    }
  }
  async addnewtag(req, res) {
    let { tagname } = req.body;
    let adminInfo;
    try {
      adminInfo = await adminModel.findOneAndUpdate(
        { uid: "#adminmodel123" },
        {
          $push: { admintags: { tagname: tagname, tagcount: 0 } },
        }
      );
      return res.status(200).send({ message: "New tag added successfully" });
    } catch (err) {
      return res.status(400).send({ message: "Unable to add new tag" });
    }
    return;
  }
  async addmodifiedtag(req, res) {
    let { oldtagname, newtagname, podcastid } = req.body;
    let adminInfo, podcastInfo, newpodcastinfo;
    try {
      podcastInfo = await podcastModel.findOne(podcastid);
      let oldtag = podcastInfo.tags;
      let newtag = [];
      for (let i = 0; i < oldtag.length; i++) {
        if (oldtag[i] !== oldtagname) {
          newtag.push(oldtag[i]);
        }
      }
      newtag.push(newtagname);
      newpodcastinfo = await podcastModel.findByIdAndUpdate(podcastid, {
        tags: newtag,
      });
    } catch (err) {
      return res
        .status(400)
        .send({ message: "Unable to tag in user section , try again" });
    }
    try {
      adminInfo = await adminModel.findOneAndUpdate(
        { uid: "#adminmodel123" },
        {
          $push: { admintags: { tagname: newtagname, tagcount: 0 } },
        }
      );
      return res.status(200).send({ message: "New tag added successfully" });
    } catch (err) {
      return res
        .status(400)
        .send({ message: "Unable to add new tag in admin , try again" });
    }
    return;
  }
  async deletetag(req, res) {
    let { tagname, podcastid } = req.body;
    let podcastInfo, newpodcastinfo;
    try {
      podcastInfo = await podcastModel.findOne(podcastid);
      let oldtag = podcastInfo.tags;
      let newtag = [];
      for (let i = 0; i < oldtag.length; i++) {
        if (oldtag[i] !== tagname) {
          newtag.push(oldtag[i]);
        }
      }
      newpodcastinfo = await podcastModel.findByIdAndUpdate(podcastid, {
        tags: newtag,
      });
      return res.status(200).send({ message: "Tag removed successfully" });
    } catch (err) {
      return res
        .status(400)
        .send({ message: "Unable to tag in user section , try again" });
    }
  }
}
module.exports = new AdminController();
