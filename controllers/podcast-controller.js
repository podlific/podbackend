const podcastModel = require("../models/podcast-model");
const sellerModel = require("../models/seller-model");
const tagsModel = require("../models/tags-model");
const adminModel = require("../models/admin-model");

class PodcastConrtoller {
  async addNewPodcast(req, res) {
    // let image;

    let {
      image: image,
      sellerId: sellerId,
      sellerUserName: sellerUserName,
      sellername: sellername,
      episodeName: episodeName,
      podcastName: podcastName,
      tags: tags,
      theme: themes,
      groups: groups,
      episodes: episodes,
      averageListener: averageListener,
      description: description,
      averageEpisodeLength: averageEpisodeLength,
      averageLTR: averageLTR,
      releaseFrequency: releaseFrequency,
    } = req.body;
    // if (req.file) {
    //   image = req.file.buffer.toString("base64");
    // }
    tags = JSON.parse(tags);
    themes = JSON.parse(themes);
    groups = JSON.parse(groups);
    episodes = JSON.parse(episodes);

    // if (
    //   !image ||
    //   !sellerId ||
    //   !sellerUserName ||
    //   !episodeName ||
    //   !podcastName ||
    //   !tags
    // ) {
    //   res.status(400).send({ massage: "Add all fields of Podcast" });
    //   return;
    // }
    const podcast = await podcastModel.create({
      image: image,
      sellerId: sellerId,
      sellerUserName: sellerUserName,
      sellername: sellername,
      episodeName: episodeName,
      podcastName: podcastName,
      tags: tags,
      theme: themes,
      groups: groups,
      episodes: episodes,
      description: description,
      averageListener: averageListener,
      averageEpisodeLength: averageEpisodeLength,
      averageLTR: averageLTR,
      releaseFrequency: releaseFrequency,
    });
    if (!podcast) {
      res.status(400).send({ message: "Error 400 Podcast not Added" });
      return;
    }
    let id = podcast._id.toString();
    const seller = await sellerModel.findByIdAndUpdate(sellerId, {
      $push: { podcast: id },
    });

    /// promise logic to add podcast Id to tags database
    const fetchUserdata = async (tag) => {
      tag = tag.toLowerCase();

      const info1 = await tagsModel.findOne({ tagName: tag });
      let idd;
      if (info1) {
        idd = info1._id;
      }
      let info;
      if (idd) {
        info = await tagsModel.findByIdAndUpdate(idd, {
          $push: {
            podcastId: { podId: id },
          },
        });
      }
      if (!info) {
        let newInfo = await tagsModel.create({
          tagName: tag,
          podcastId: { podId: id },
        });
      }
      return;
    };
    const fetchUserInfo = async (tags) => {
      const requests =
        Array.isArray(tags) &&
        tags.map((tag) => {
          return fetchUserdata(tag);
        });
    };
    await fetchUserInfo(tags);
    res.send(podcast);
    return;
  }

  async getPodcastFromTags(req, res) {
    const { tags } = req.body;
    if (!tags) {
      res.status(400).send({ message: "Please add tags" });
      return;
    }

    const fetchFromPodcastList = async (podId) => {
      const podcast = await podcastModel.findById(podId);
      return podcast;
    };
    const fetchListOfPodcast = async (tag) => {
      const info1 = await tagsModel.findOne({ tagName: tag });
      if (info1 === null) {
        return [];
      }
      const request1 = info1.podcastId.map((podId) => {
        return fetchFromPodcastList(podId.podId).then((a) => {
          return a;
        });
      });

      return await Promise.all(request1);
    };
    const fetchPodcastInfo = async (tags) => {
      const requests = tags.map((tag) => {
        tag = tag.toLowerCase();
        return fetchListOfPodcast(tag).then((a) => {
          if (a) {
            return a;
          } else {
            return [];
          }
        });
      });
      return await Promise.all(requests);
    };
    const podcastArray = await fetchPodcastInfo(tags).then((a) => {
      return a;
    });
    const unique = [...new Set(podcastArray.map((item) => item._id))];
    res.status(200).send(podcastArray);
    return;
  }
  async getPodcastFromSearch(req, res) {
    const { searchItem } = req.body;
    const info = await podcastModel.find({
      podcastName: { $regex: searchItem, $options: "i" },
    });

    res.status(200).send(info);
  }
  async getPodcastFromParticularUser(req, res) {
    let { userId } = req.body;
    let info = await podcastModel.find({ sellerId: userId });
    if (info) {
      res.status(200).send(info);
      return;
    }
    res.status(500).send({ message: "Pocast not found" });
    return;
  }
  async updatePodcastRequest(req, res) {
    const { podcastid, buyerid, sellerid, date, time } = req.body;
    if (!podcastid || !buyerid || !sellerid || !date || !time) {
      res.status(400).send({ message: "Select all fields" });
      return;
    }
    let info1;
    try {
      info1 = await podcastModel.findByIdAndUpdate(podcastid, {
        $push: {
          bookings: { date, time },
        },
      });
    } catch (err) {
      res.status(400).send({ message: "Unable to update request" });
    }
    if (!info1) {
      res.status(400).send({ message: "Time not Updated" });
      return;
    }
    res.status(200).send({ message: "Time updated" });
    return;
  }
  async updatePodcastByUser(req, res) {
    const { podcastid, buyerid, sellerid, date, time } = req.body;
    if (!podcastid || !buyerid || !sellerid || !date || !time) {
      res.status(400).send({ message: "Select all fields" });
      return;
    }
    let info2 = await sellerModel.findById(buyerid);
    let request = info2.requests;
    for (let i = request.length - 1; i >= 0; i--) {
      if (
        request[i].sellerid === sellerid &&
        request[i].buyerid === buyerid &&
        request[i].podcastid === podcastid
      ) {
        request[i].confirmed = "true";
        request[i].date = date;
        request[i].time = time;
        break;
      }
    }
    try {
      info2 = await sellerModel.findByIdAndUpdate(buyerid, {
        requests: request,
      });
    } catch (err) {
      res.status(400).send({ message: "Unable to update request" });
      return;
    }
    try {
      info2 = await sellerModel.findById(sellerid);
    } catch (err) {
      res.status(400).send({ message: "Unable to update request" });
      return;
    }
    request = info2.requests;
    for (let i = request.length - 1; i >= 0; i--) {
      if (
        request[i].sellerid === sellerid &&
        request[i].buyerid === buyerid &&
        request[i].podcastid === podcastid
      ) {
        request[i].confirmed = "true";
        request[i].date = date;
        request[i].time = time;
        break;
      }
    }
    try {
      info2 = await sellerModel.findByIdAndUpdate(sellerid, {
        requests: request,
      });
    } catch (err) {
      res.status(400).send({ message: "Unable to update request" });
      return;
    }

    res.status(200).send({ message: "Cofirmed Times" });
  }
  async removeDeletedTime(req, res) {
    const { podcastid, date, time } = req.body;
    let info;
    try {
      info = await podcastModel.findById(podcastid);
      if (!info) {
        res.status(400).send({ message: "No podcast found" });
        return;
      }
    } catch (err) {
      res.status(500).send({ message: "No podcast found" });
      return;
    }
    let arr = [];
    let booking = info.bookings;
    for (let i = 0; i < booking.length; i++) {
      if (booking[i].date !== date && booking[i].time !== time) {
        arr.push(booking[i]);
      }
    }
    try {
      info = await podcastModel.findByIdAndUpdate(podcastid, { bookings: arr });
    } catch (err) {
      res.status(400).send({ message: "Unable to update request" });
      return;
    }
    if (!info) {
      res.status(400).send({ message: "Time not deleted " });
      return;
    }
    res.status(200).send(info);
    return;
  }
  async addnewpodcastbyuser(req, res) {
    let {
      image: image,
      sellerId: sellerId,
      sellerUserName: sellerUserName,
      sellername: sellername,
      episodeName: episodeName,
      podcastName: podcastName,
      tags: tags,
      requestedtags: requestedtags,
      averageListener: averageListener,
      description: description,
      averageEpisodeLength: averageEpisodeLength,
      averageLTR: averageLTR,
      releaseFrequency: releaseFrequency,
    } = req.body;
    let podcast;
    try {
      podcast = await podcastModel.create({
        image: image,
        sellerId: sellerId,
        sellerUserName: sellerUserName,
        sellername: sellername,
        episodeName: episodeName,
        podcastName: podcastName,
        tags: tags,
        requestedtags: requestedtags,
        description: description,
        averageListener: averageListener,
        averageEpisodeLength: averageEpisodeLength,
        averageLTR: averageLTR,
        releaseFrequency: releaseFrequency,
      });
    } catch (err) {
      res.status(400).send({ message: "Error 400 Podcast not Added" });
      return;
    }
    let id = podcast._id.toString();
    let seller;
    try {
      seller = await sellerModel.findByIdAndUpdate(sellerId, {
        $push: { podcast: id },
      });
    } catch (err) {
      return res.status(400).send({ message: "Unable to add podcast seller" });
    }
    let uid = "#adminmodel123";
    let adminInfo, adminInfo1;
    let requestedTagsWithId = [];
    for (let i = 0; i < requestedtags.length; i++) {
      requestedTagsWithId.push({ tagname: requestedtags[i], podcastid: id });
    }
    let oldtags = new Map();
    for (let i = 0; i < tags.length; i++) {
      let curr = 0;
      oldtags.set(tags[i], curr + 1);
    }
    try {
      adminInfo = await adminModel.find({ uid: "#adminmodel123" });
      let admintagscount = adminInfo[0].admintags;
      for (let i = 0; i < admintagscount.length; i++) {
        if (oldtags.has(admintagscount[i].tagname)) {
          admintagscount[i].tagcount++;
        }
      }
      adminInfo1 = await adminModel.findOneAndUpdate(
        { uid: "#adminmodel123" },
        {
          admintags: admintagscount,
          $push: { requestedtags: requestedTagsWithId },
        }
      );

      return res
        .status(200)
        .send({ message: "New Podcast added Successfully" });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .send({ message: "Unable to add request for new podcast" });
    }
    return;
  }
}
module.exports = new PodcastConrtoller();
// let temp = "data:image/png;base64," + image;

//     res.send(
//       `<div>
// <img
// src=${temp}
// alt=""
//  />
// </div>`
//     );
