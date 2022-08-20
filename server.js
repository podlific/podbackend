const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cookieParser = require("cookie-parser");
const app = express();
const router = require("./routes");
const DbConnect = require("./database");
const PORT = process.env.PORT || 3500;
const cors = require("cors");
const server = http.createServer(app);
const io = new Server(server);
// middlewares
DbConnect();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(express.json());
const corsOption = {
  credentials: true,
  origin: ["https://podfrontend.vercel.app"],
  //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOption));
app.use(router);
// requests
app.get("/", (req, res) => {
  res.send("Hello from server ");
});
// ic connection
let users = [];

const usernameMap = {};
const socket_to_user = {};
io.on("connection", (socket) => {
  //when connect
  socket.on("connected", ({ user }) => {
    usernameMap[user.unique_id] = socket.id;
    socket_to_user[socket.it] = user.unique_id;
  });
  socket.on(
    "private message",
    ({
      content,
      to,
      from,
      date,
      time,
      seen,
      request,
      podcastid,
      selectedDate,
      selectedTime,
    }) => {
      if (usernameMap[to] === undefined) {
        return;
      }

      socket.to(usernameMap[to]).emit("private message", {
        content,
        from: from,
        date,
        time,
        seen,
        request,
        podcastid,
        selectedDate,
        selectedTime,
      });
    }
  );

  socket.on(
    "new request message",
    ({ content, to, from, date, time, seen, request }) => {
      if (usernameMap[to] === undefined) {
        return;
      }

      socket.to(usernameMap[to]).emit("new request message", {
        content,
        from: from,
        date,
        time,
        seen,
        request,
      });
    }
  );
  socket.on("disconnecting", () => {
    let id = socket.it;
    let curr_user = socket_to_user[id];
    delete socket_to_user[id];
    delete usernameMap[curr_user];
    socket.leave();
  });
});
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
