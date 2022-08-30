const podcastModel = require("../models/podcast-model");
const sellerModel = require("../models/seller-model");
const tagsModel = require("../models/tags-model");

class PodcastConrtoller {
  async addNewPodcast(req, res) {
    let image;

    let {
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
    if (req.file) {
      image = req.file.buffer.toString("base64");
    }
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
    let info1 = await podcastModel.findByIdAndUpdate(podcastid, {
      $push: {
        bookings: { date, time },
      },
    });
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
    for (let i = 0; i < request.length; i++) {
      if (
        request[i].sellerid === sellerid &&
        request[i].buyerid === buyerid &&
        request[i].podcastid === podcastid
      ) {
        request[i].confirmed = "true";
        request[i].date = date;
        request[i].time = time;
      }
    }
    info2 = await sellerModel.findByIdAndUpdate(buyerid, {
      requests: request,
    });
    info2 = await sellerModel.findById(sellerid);
    request = info2.requests;
    for (let i = 0; i < request.length; i++) {
      if (
        request[i].sellerid === sellerid &&
        request[i].buyerid === buyerid &&
        request[i].podcastid === podcastid
      ) {
        request[i].confirmed = "true";
        request[i].date = date;
        request[i].time = time;
      }
    }
    info2 = await sellerModel.findByIdAndUpdate(sellerid, {
      requests: request,
    });

    res.status(200).send({ message: "Cofirmed Times" });
  }
  async removeDeletedTime(req, res) {
    const { podcastid, date, time } = req.body;
    let info = await podcastModel.findById(podcastid);
    if (!info) {
      res.status(400).send({ message: "No podcast found" });
      return;
    }
    let arr = [];
    let booking = info.bookings;
    for (let i = 0; i < booking.length; i++) {
      if (booking[i].date !== date && booking[i].time !== time) {
        arr.push(booking[i]);
      }
    }
    info = await podcastModel.findByIdAndUpdate(podcastid, { bookings: arr });
    if (!info) {
      res.status(400).send({ message: "Time not deleted " });
      return;
    }
    res.status(200).send(info);
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
