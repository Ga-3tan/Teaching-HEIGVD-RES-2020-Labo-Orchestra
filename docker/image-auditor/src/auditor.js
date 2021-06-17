
const dgram = require('dgram');
const net = require('net');
const moment = require('moment');

const UDP_PORT = 9907;
const MULTICAST_ADDRESS = "239.255.22.5";
const TCP_PORT = 2205;

const instSounds = new Map();
instSounds.set('ti-ta-ti', 'piano');
instSounds.set('pouet', 'trumpet');
instSounds.set('trulu', 'flute');
instSounds.set('gzi-gzi', 'violin');
instSounds.set('boum-boum', 'drum');

const socket = dgram.createSocket('udp4');

var musicians = [];

/* UDP server */

// binding port to multicast address
socket.bind(UDP_PORT, function () {
  console.log("Listening musicians playing");
  socket.addMembership(MULTICAST_ADDRESS);
});

// each time data arrives on the UDP server
socket.on('message', function(msg, source) {
  console.log("Data has arrived: " + msg + ". Source port: " + source.port);

  musician = JSON.parse(msg);
  musicianIndex = musicians.findIndex(x => x.uuid === musician.uuid); // checks if musician already exists here
  
  if (musicianIndex === -1) { // new musician
    console.log("added musician : " + musician.uuid);
    musician.activeSince = moment().toISOString();
    musician.instrument = instSounds.get(musician.sound);
    musician.notActiveSince = 0;
    musicians.push(musician);  
  } else { // existing musician
    musicians[musicianIndex].notActiveSince = 0; // musician heard, notActiveSince counter reseted
  }
});

// every second, increase the notActiveSince counter of all musicians
setInterval(function() {
  musicians.forEach(function(musician, index, object) {
    musician.notActiveSince += 1;
    if (musician.notActiveSince > 5) { // not heard for more than 5 secondes, remove musician
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

tcpServer.listen(TCP_PORT);