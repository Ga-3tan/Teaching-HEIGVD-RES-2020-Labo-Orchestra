const protocol = require('./orchestra-protocol');
const dgram = require('dgram');
const net = require('net');

// UDP socket
const s = dgram.createSocket('udp4');

// Map for sound - instrument association
const instSounds = new Map();
instSounds.set('ti-ta-ti', 'piano');
instSounds.set('pouet', 'trumpet');
instSounds.set('trulu', 'flute');
instSounds.set('gzi-gzi', 'violin');
instSounds.set('boum-boum', 'drum');

// List of playing musicians
let listMusicians = [];

/**
 * Called to clear musicians that are not playing anymore
 */
function clearOldMusicians() {
  let currentDate = new Date(Date.now());

  // Clears old musicians
  let i = 0;
  while (i < listMusicians.length) {
    if (listMusicians[i].seconds > 5) {
      console.log('Not responding since : ' + listMusicians[i].seconds);
      listMusicians.splice(i, 1);
    }
    else {
      ++i;
    }
  }
}

/**
 * Updates musicians elapsed seconds
 */
function incrementMusiciansSeconds() {
  listMusicians.forEach(function(musician) {
    musician.seconds++;
  });
}

/**
 * Joins the multicast UDP group
 */
s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/**
 * Called when a sound arrives on the multicast address
 */
s.on('message', function(msg, source) {
  console.log("Data has arrived: " + msg + ". Source port: " + source.port);

  // Parses the received JSON data
  let data = JSON.parse(msg);

  // Checks is already in the list
  let musicianExists = false;
  listMusicians.forEach(function(musician) {
    if (musician.uuid === data.uuid) {
      musicianExists = true;
    }
  });

  // Adds the musician in the list if new or updates the activeSince date
  if (!musicianExists) {
    console.log('Adding musician to list !')
    let musician = {
      uuid: data.uuid,
      instrument: instSounds.get(data.sound),
      activeSince: new Date(Date.now()).toISOString(),
      seconds: 0
    };

    listMusicians.push(musician);
  } else {
    // Updates the active date
    console.log('Updating musician elapsed seconds')
    let toUpdate = listMusicians.find(m => m.uuid === data.uuid);
    toUpdate.seconds = 0;
  }
});

/**
 * Called when a client connects via TCP
 */
var tcpServer = net.createServer(function(socket) {
  console.log('A client connected to TCP !');

  // Clears not responding musicians
  clearOldMusicians();

  // Constructs the musicians list
  let outputList = JSON.parse(JSON.stringify(listMusicians));

  // Removes seconds property
  outputList.forEach(function(m){ delete m.seconds });

  // Sends the list of active musicians
  socket.write(JSON.stringify(listMusicians));
  socket.pipe(socket);
  socket.destroy();
});

tcpServer.listen(protocol.PROTOCOL_TCP_LISTEN_PORT);

// Updates musicians
setInterval(function() {
  incrementMusiciansSeconds();
}, 1000);