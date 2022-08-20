const adminModel = require("../models/admin-model");
const sellerModel = require("../models/seller-model");
const nodemailer = require("nodemailer");
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
    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      secureConnection: true,
      starttls: {
        enable: true,
      },
      port: 587,
      tls: {
        ciphers: "SSLv3",
      },
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    let info1 = await transporter.sendMail({
      from: "tt2504669@gmail.com",
      to: email,
      subject: "Podilific Account Details",
      text: `Hey , your Podilific account username is ${username} and password is ${password}. `,
      html: `Hey , your Podilific account username is ${username} and password is ${password}. `,
    });
    if (!info1) {
      res.status(400).send({ message: "Email not sent " });
      return;
    }
    res.status(200).send({ message: "Email sent sucessfully" });
    return;
  }
  async deleteuserrequest(req, res) {
    const { username } = req.body;
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
    info = await adminModel.findOneAndUpdate(uid, {
      $push: { broadcastmessages: text },
    });
    if (info) {
      res.status(200).send({ message: " Message Broadcasted Successfully" });
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
      let user = await sellerModel.create({
        username: data.username,
        usertype: data.usertype,
        password: password,
        email: data?.email,
        companyname: data?.companyname,
        name: data?.name,
        phoneno: data?.phoneno,
      });
      let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        secureConnection: true,
        starttls: {
          enable: true,
        },
        port: 587,
        tls: {
          ciphers: "SSLv3",
        },
        service: "gmail",
        auth: {
          user: process.env.GMAIL_ID,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
      let info1 = await transporter.sendMail({
        from: "tt2504669@gmail.com",
        to: data.email,
        subject: "Podilific Account Details",
        text: `Hey , your Podilific account username is ${data.username} and password is ${password}. `,
        html: `Hey , your Podilific account username is ${data.username} and password is ${password}. `,
      });
      return user;
    };
    const fetchCSVdataInfo = async (data) => {
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
}
module.exports = new AdminController();
