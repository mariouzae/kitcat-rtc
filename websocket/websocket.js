module.exports = (io) => {
  
  /** web socket routes */
  io.on('connection', function (socket) {
    console.log('user connected');
  });

};