const SDP = require('../model/SDP');
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

    socket.on('message', function(data){
      switch(data.type) {
        case "offer":
          var sdp = new SDP(data.type, data.name, data.target, data.sdp);
          var socketUser = getUser(sdp);
          if (socketUser) {
            socketUser.emit('offer', sdp);
          }
          break;

        case "answer":
          break;

        default:

      }
    });

    socket.on('disconnect', function(){
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
        user =  element;
      }
    });
    return user;
  };

};