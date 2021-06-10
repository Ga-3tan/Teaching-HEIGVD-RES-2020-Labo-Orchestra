
const instruments = {
  'ti-ta-ti'  : "piano",
  'pouet'     : "trumpet",
  'trulu'     : "flute",
  'gzi-gzi'   : "violin",
  'boum-boum' : "drum",
}

const dgram = require('dgram');
const net = require('net');
const uuid = require('uuid');

const PORTOCOL_PORT = 9907;
const PROTOCOL_MULTICAST_ADDRESS = "239.255.22.5";

const TCP_PORT = 2205;

const socket = dgram.createSocket('udp4');

var musicians = [];

/* UDP server */
socket.bind(PORTOCOL_PORT, function () {
  console.log("Listening musicians playing");
  socket.addMembership(PROTOCOL_MULTICAST_ADDRESS);
});

socket.on('message', function(msg, source) {
  console.log("Data has arrived: " + msg + ". Source port: " + source.port);

  musician = JSON.parse(msg);
  musicianIndex = musicians.findIndex(x => x.uuid === musician.uuid);

  if (musicianIndex === -1) {             // new musician
    musician.activeSince = new Date();
    musician.notActiveSince = 0;
    musicians.push(musician);
  } else {                                // existing musician
    musicians[musicianIndex].notActiveSince = 0;
  }

});

setInterval(function() {
  musicians.forEach(function(musician, index, object) {
    musician.notActiveSince += 1;
    console.log("not active musician : " + musician.uuid);
    if (musician.notActiveSince > 5) {
      console.log("removed musician : " + musician.uuid);
      object.splice(index, 1);
    }
  });
}, 1000);

/* TCP Server */
var tcpServer = net.createServer(function(socket) {
  console.log('A client connected to TCP !');
  musiciansPayload = [];
  musicians.forEach(musician => {
    musiciansPayload.push({
      uuid : musician.uuid,
      instrument : musician.instrument,
      activeSince : musician.activeSince,
    })
  })
  socket.write(JSON.stringify(musiciansPayload));
  socket.destroy();
});
tcpServer.listen(2205);