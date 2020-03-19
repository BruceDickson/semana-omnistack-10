import socketio from 'socket.io-client';

const socket = socketio('http://192.168.0.12:3333', {
    autoConnect: false,
});

function subscribeToNewDevs(subscibeFunction){
    socket.on('new-dev', subscibeFunction);
}

function connect(latitude, longitude, techs){
    socket.io.opts.query = {
        latitude,
        longitude,
        techs,
    };

    socket.connect();
}

function disconnect(){
    if(socket.connected) socket.disconnect();
}

export {
    connect,
    disconnect,
    subscribeToNewDevs
};