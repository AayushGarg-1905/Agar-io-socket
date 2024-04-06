const express = require('express');
const app = express();
const socketio = require('socket.io');

app.use(express.static(__dirname+'/public'));
const expressServer = app.listen(9000,()=>{
    console.log('server is listening on 9000...')
}) 
const io = socketio(expressServer);

// servers.js is not the entry point of our code, it just create the servers and exports them

module.exports = {
    app,
    io
}