const SDP = require('../model/SDP');
const User = require('../model/User');
let users = [];

module.exports = (io) => {
  
  /** web socket routes */
  io.on('connection', function (socket) {
    console.log('user connected');
    //var sdp = new SDP('offer', 'mario', 'call', 'teste');
    socket.on('message', function(data){
      switch(data.type) {
        case "offer":
          break;

        case "answer":
          break;

        default:

      }
    });

    socket.on('disconnect', function(){
      console.log('bye...');
    })
  });

};