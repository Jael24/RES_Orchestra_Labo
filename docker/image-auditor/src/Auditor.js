/* eslint-disable no-console */
const dgram = require('dgram');
const net = require('net');
const moment = require('moment');
const protocol = require('./sensor-protocol');

const sounds = new Map([
    ['ti-ta-ti', 'piano'],
    ['pouet', 'trumpet'],
    ['trulu', 'flute'],
    ['gzi-gzi', 'violin'],
    ['boum-boum', 'drum'],
]);



s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

let musicians = [];

s.on('message', function(msg, source) {
	
	console.log("Data has arrived : " + msg + ". Source port : " + source.port);
    const parsedMsg = JSON.parse(msg);
	
	const uuid = parsedMsg.uuid;
	const instrument = sounds.get(parsedMsg.sound);
	const activeSince = parsedMsg.activeSince;

	for (let i = 0; i < musicians.length; i += 1) {
		if (musicians[i].uuid === uuid) {
			musicians[i].instrument = instrument;
			musicians[i].activeSince = activeSince;
			return;
		}
	}
	
	musicians.push({
		uuid: uuid,
		instrument: instrument,
		activeSince: activeSince,
	});
	
});

const server = net.createServer(function(socket) {
    const activeMusicians = [];
    for (let i = 0; i < musicians.length; i += 1) {

        if (Date.now() - musicians[i].activeSince <= 5000) {
            activeMusicians.push({
                uuid: musicians[i].uuid,
                instrument: musicians[i].instrument,
                activeSince: new Date(musicians[i].activeSince),
            });
        }
    }
    const payload = JSON.stringify(activeMusicians);

    socket.write(payload);
    socket.pipe(socket);
    socket.end();
});
server.listen(2205);