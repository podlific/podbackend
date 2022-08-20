const router = require("express").Router();
const multer = require("multer");
const adminController = require("./controllers/admin-controller");
const AuthController = require("./controllers/Auth-controller");
const messageController = require("./controllers/message-controller");
const podcastController = require("./controllers/podcast-controller");

const upload = multer({ storage: multer.memoryStorage() });
/// Auth route
router.post("/api/signup", AuthController.signUp);
router.post("/api/login", AuthController.login);
router.get("/api/refresh", AuthController.refresh);
router.post("/api/logout", AuthController.logout);
/// Message Route
router.post("/api/messagesent", messageController.firstMessage);
router.post("/api/getconnected", messageController.getConnectedUsers);
router.post("/api/sendnewmessages", messageController.updateNewMessage);
router.post("/api/extractmessages", messageController.getNewMessage);
router.post("/api/oldmessageupdate", messageController.updateOldMessages);
router.post("/api/updatecontacts", messageController.updatenewcontact);
router.post(
  "/api/updatepodcastrequest",
  messageController.updatepodcastrequest
);
//// Podcast Route
router.post(
  "/api/addnewpodcast",
  upload.single("image"),
  podcastController.addNewPodcast
);
router.post("/api/getpodcastfromtags", podcastController.getPodcastFromTags);
router.post(
  "/api/getpodcastfromsearch",
  podcastController.getPodcastFromSearch
);
router.post(
  "/api/getpodcastforparticularuser",
  podcastController.getPodcastFromParticularUser
);
router.post("/api/updaterequest", podcastController.updatePodcastRequest);
router.post("/api/updaterequestbyuser", podcastController.updatePodcastByUser);
router.post("/api/removetimefrompodcast", podcastController.removeDeletedTime);

/// Admin Routes
router.post("/api/getadmininfo", adminController.getAdminData);
router.post("/api/addnewuseronrequest", adminController.addNewUsertoRequest);
router.get("/api/getalluser", adminController.getalluserforadmin);
router.post("/api/createnewuseraccount", adminController.createNewUserAccount);
router.post("/api/deleteuserrequest", adminController.deleteuserrequest);
router.post("/api/postbroadcastmessage", adminController.addbrocasttext);
router.post("/api/addcsvdata", adminController.adddatausingcsv);
router.post("/api/updateadmintags", adminController.updateadmintags);
router.post("/api/sendinfoforuser", adminController.sendinfoforuser);
module.exports = router;
