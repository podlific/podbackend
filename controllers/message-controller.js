var ObjectId = require("mongodb").ObjectID;
const messageModel = require("../models/messages-model");
const sellerModel = require("../models/seller-model");

class MessageController {
  async firstMessage(req, res) {
    // here we are finding that the user are not connected before
    const user = await sellerModel.findById("62d91524c24b37878c3852ec");
    if (!user) {
      res.status(400).send({ message: "User not found " });
      return;
    }
    // const connectUser = user.connected;
    // const found = connectUser.indexOf(ObjectId("62d51b7f0725894c19c75ca7"));

    //   let found1 = chats.indexOf(ObjectId("62d51b7f0725894c19c75cb7"));
    let f = -1;
    for (let i = 0; i < user.chats.length; i++) {
      if (
        user.chats[i].connectedUser.toString() === "62d51b7f0725894c19c75ca7"
      ) {
        f = i;
        break;
      }
    }
    if (f !== -1) {
      let chatId = user.chats[f].chatId;
      let mes = await messageModel.findByIdAndUpdate(chatId, {
        $push: {
          message: {
            text: "Yeh I am added",
            from: ObjectId("62d51b7f0725894c19c75ca7"),
            to: ObjectId("62d91524c24b37878c3852ec"),
          },
        },
        isUpdated: false,
      });
      if (!mes) {
        res.status(400).send({ message: "Unable to retrieve message " });
        return;
      }
      res.status(200).send({ message: "message added successfully" });
      return;
    }

    // if user connect for the first time
    try {
      const mes = await messageModel.create({
        isUpdated: true,
        message: {
          text: "Hello we are live",
          from: ObjectId("62d51b7f0725894c19c75ca7"),
          to: ObjectId("62d91524c24b37878c3852ec"),
        },
      });
      let id = mes._id;
      const user1 = await sellerModel.findByIdAndUpdate(mes.message[0].from, {
        $push: {
          chats: {
            chatId: ObjectId(id),
            connectedUser: ObjectId(mes.message[0].to),
          },
          connected: ObjectId(mes.message[0].to),
        },
      });
      if (!user1) {
        res.status(400).send({ message: "User not found 1" });
        return;
        // throw new Error("user not found");
      }
      const user2 = await sellerModel.findByIdAndUpdate(mes.message[0].to, {
        $push: {
          chats: {
            chatId: ObjectId(id),
            connectedUser: ObjectId(mes.message[0].from),
          },
          connected: ObjectId(mes.message[0].from),
        },
      });
      if (!user2) {
        res.status(400).send({ message: "User not found 2" });
        return;
        // throw new Error("user not found");
      }
      res.send(mes);
    } catch (err) {
      res.status(400).send({ message: "Unable" });
    }
  }

  // message sent || normal conversation

  async sentmessage(req, res) {}
  async getConnectedUsers(req, res) {
    const currUserId = req.body.currUserId;
    if (!currUserId) {
      res.status(400).send({ message: "Enter user Id" });
      return;
    }
    const currUser = await sellerModel.findById(currUserId);
    if (!currUser) {
      res.status(400).send({ message: "User not found " });
      return;
    }
    const connectedUser = currUser.connected;

    const fetchUserdata = async (userId) => {
      const info = await sellerModel.findById(userId);
      if (!info) {
        return;
      }
      let id = info._id.toString();
      return {
        userId: id,
        userName: info.username,
        userType: info.usertype,
      };
    };

    const fetchUserInfo = async (users) => {
      const requests = users.map((user) => {
        user = user.toString();

        return fetchUserdata(user).then((a) => {
          return a;
        });
      });
      return Promise.all(requests);
    };

    const info = await fetchUserInfo(connectedUser).then((a) => {
      return a;
    });
    res.send(info);
  }
  async updateNewMessage(req, res) {
    const newMessages = req.body;
    const to = newMessages.to;
    const from = newMessages.from;
    if (!newMessages || !from || !to) {
      res.status(400).send({ message: "Messages not updated" });
      return;
    }
    try {
      newMessages.seen = "false";
      const mes1 = await sellerModel.findByIdAndUpdate(to, {
        $push: {
          messages: newMessages,
        },
      });
      newMessages.seen = "true";
      const mes2 = await sellerModel.findByIdAndUpdate(from, {
        $push: {
          messages: newMessages,
        },
      });
      if (!mes1) {
        res.status(400).send({ message: "New message not addedd 1" });
        return;
      }
      if (!mes2) {
        res.status(400).send({ message: "New message not addedd 2" });
        return;
      }
      res.status(200).send({ message: "New message added successfully" });
      return;
    } catch (err) {
      res.status(400).send({ message: "New messages not added " });
      return;
    }
  }
  async updateOldMessages(req, res) {
    const newMessages = req.body.message;
    const from = req.body.from;
    if (!from) {
      res.status(400).send({ message: "Messages not updated" });
      return;
    }
    try {
      const mes1 = await sellerModel.findByIdAndUpdate(from, {
        messages: newMessages,
      });
      if (!mes1) {
        res.status(400).send({ message: "Old message not updated 1" });
        return;
      }
      res.status(200).send({ message: " message updated" });
    } catch (err) {
      res.status(400).send({ message: "Old message not updated 2" });
      return;
    }
  }
  async getNewMessage(req, res) {
    const userId = req.body.userId;
    if (!userId) {
      res.status(400).send({ message: "Enter user Id" });
      return;
    }
    try {
      const mes = await sellerModel.findById(userId);
      if (!mes) {
        res.status(400).send({ message: "Unable to get data from database" });
        return;
      }
      let data = {
        messages: mes.messages,
        requests: mes.requests,
      };
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send({ message: "Unable to extract" });
      return;
    }
    return;
    // res.status(200).send({ message: "chutiye" });
  }
  async updatenewcontact(req, res) {
    const from = req.body.from;
    const newuser = req.body.newuser;
    if (!from || !newuser) {
      res.status(400).send({ message: "contacts not updated" });
      return;
    }
    try {
      const mes1 = await sellerModel.findByIdAndUpdate(newuser, {
        $push: {
          connected: from,
        },
      });
      const mes2 = await sellerModel.findByIdAndUpdate(from, {
        $push: {
          connected: newuser,
        },
      });
      if (!mes1) {
        res.status(400).send({ message: "New user not addedd 1" });
        return;
      }
      if (!mes2) {
        res.status(400).send({ message: "New user not addedd 2" });
        return;
      }
      res.status(200).send({ message: "New user added successfully" });
      return;
    } catch (err) {
      res.status(400).send({ message: "users not updated 2" });
      return;
    }
  }

  async updatepodcastrequest(req, res) {
    const to = req.body.sellerid;
    const from = req.body.buyerid;
    if (!from || !to) {
      res.status(400).send({ message: "request not updated" });
      return;
    }
    try {
      const mes1 = await sellerModel.findByIdAndUpdate(to, {
        $push: {
          requests: req.body,
        },
      });
      const mes2 = await sellerModel.findByIdAndUpdate(from, {
        $push: {
          requests: req.body,
        },
      });
      if (!mes1) {
        res.status(400).send({ message: "New request not added seller" });
        return;
      }
      if (!mes2) {
        res.status(400).send({ message: "New reuest not add buyer" });
        return;
      }
      res.status(200).send({ message: "New request updated successfully" });
      return;
    } catch (err) {
      res.status(400).send({ message: "Request not updated" });
      return;
    }
  }
}
module.exports = new MessageController();
