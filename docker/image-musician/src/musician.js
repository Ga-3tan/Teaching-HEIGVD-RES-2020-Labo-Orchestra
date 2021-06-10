const { v4: uuidv4 } = require('uuid');
let protocol = require('./orchestra-protocol');
let dgram = require('dgram');
let s = dgram.createSocket('udp4');

function Musician(instrument) {

	this.uuid = uuidv4();

	this.instSounds = new Map();
	this.instSounds.set('piano', 'ti-ta-ti');
	this.instSounds.set('trumpet', 'pouet');
	this.instSounds.set('flute', 'trulu');
	this.instSounds.set('violin', 'gzi-gzi');
	this.instSounds.set('drum', 'boum-boum');

	this.instrument = instrument;

	Musician.prototype.play = function() {
		var playSound = this.instSounds.get(this.instrument);

		var audioData = {
			uuid: this.uuid,
			sound: playSound
		};

		var payload = JSON.stringify(audioData);

		let message = new Buffer(payload);

		s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
		});
	}

	setInterval(this.play.bind(this), 1000);
}

/*
 * Let's get the thermometer properties from the command line attributes
 * Some error handling wouln't hurt here...
 */
var instrument = process.argv[2];

/*
 * Let's create a new thermoter - the regular publication of measures will
 * be initiated within the constructor
 */
var t1 = new Musician(instrument);
