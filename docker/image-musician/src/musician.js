
const uuid = require('uuid');
const dgram = require('dgram');

const UDP_PORT = 9907
const MULTICAST_ADDRESS = "239.255.22.5";

const socket = dgram.createSocket('udp4');

const instSounds = new Map();
instSounds.set('piano', 'ti-ta-ti');
instSounds.set('trumpet', 'pouet');
instSounds.set('flute', 'trulu');
instSounds.set('violin', 'gzi-gzi');
instSounds.set('drum', 'boum-boum');

var instrument = process.argv[2];

// if no instrument specified or wrong instrument name specified
if (instrument == undefined || !instSounds.has(instrument)) {
  instrument = 'piano'; // set piano as default instrument 
}

function Musician() {
  const musician = {
    uuid : uuid.v4(),
    sound : instSounds.get(instrument)
  };

  var buffer = new Buffer.from(JSON.stringify(musician), 'utf8');

  // send data every seconds
  setInterval(function() {
    socket.send(buffer, 0, buffer.length, UDP_PORT, MULTICAST_ADDRESS, function(err, bytes) {
      console.log(musician.uuid + " is playing the " + instrument + " via port " +  socket.address().port + " : " +  musician.sound);
    });
  }, 1000);
}

var m = new Musician();
