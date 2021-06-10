
const instruments = {
  piano   : "ti-ta-ti",
  trumpet : "pouet",
  flute   : "trulu",
  violin  : "gzi-gzi",
  drum    : "boum-boum",
}

const uuid = require('uuid');

const PROTOCOL_PORT = 9907
const PROTOCOL_MULTICAST_ADDRESS = "239.255.22.5";

var dgram = require('dgram');
var socket = dgram.createSocket('udp4');

/* get creation date */
var datetime = new Date();

/* get instruments from parameters */
var args = process.argv.slice(2);
var sound = instruments[args[0]];
var instrument = args[0];

const musician = {
  uuid : uuid.v4(),
  instrument : instrument,
};

console.log(musician.stringify);

function Musician(sound) {
  var buffer = new Buffer(JSON.stringify(musician));
  
  setInterval(function() {
    socket.send(buffer, 0, buffer.length, PROTOCOL_PORT, PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
      console.log(musician.uuid + " is playing the " + musician.instrument + " via port " +  socket.address().port + " : " +  sound);
    });
  }, 1000);
}

var m = new Musician(sound);
