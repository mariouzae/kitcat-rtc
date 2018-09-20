const SDP = require('../model/SDP');
const ICE = require('../model/ICE');
const User = require('../model/User');
let users = [];

module.exports = (io) => {

  /** web socket routes */
  io.on('connection', function (socket) {
    socket.username = socket.handshake.query.username;

    // add new user to list
    users.push(socket);

    // show current logged users
    users.forEach(e => {
      console.log("User: ", e.username);
    });

    /**
     * Deliver a video offer based on user target
     */
    socket.on('message', function (data) {
      switch (data.type) {
        case "offer":
          var sdp = new SDP(data.type, data.name, data.target, data.sdp);
          var socketUser = getUser(sdp);
          if (socketUser) {
            socketUser.emit('offer', sdp);
          }
          break;

        case "answer":
          var sdp = new SDP(data.type, data.name, data.target, data.sdp);
          var socketUser = getUser(sdp);
          if (socketUser) {
            socketUser.emit('answer', sdp);
          }
          break;

        case "new-ice-candidate":
          var ice = new ICE(data.type, data.target, data.candidate);
          var socketUser = getUser(ice);
          if (socketUser) {
            socketUser.emit('new-ice-candidate', ice);
          }
          break;

        default:
      }
    });

    socket.on('disconnect', function () {
      // remove user from global list
      users.forEach((element, index) => {
        if (socket.username === element.username) {
          users.splice(index, 1);
        }
      });
    });

  });

  function getUser(data) {
    user = null;
    users.forEach((element) => {
      if (element.username === data.target) {
        user = element;
      }
    });
    return user;
  };

};