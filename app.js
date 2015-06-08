

// SERVER HTTP


var express = require('express');
var app = express();

app.use('/static', express.static('static'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/home.html');
});

var server = app.listen(3000, function () {
    console.log('HTTP Server run in http://127.0.0.1:3000/');
});


// SERVER WEBSOCKET


var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 1414 });


var CLIENTS = {};
wss.on('connection', function connection(ws) {
    var id = ws.upgradeReq.headers['sec-websocket-key'];
    CLIENTS[id] = { x: 0, y: 0 };
    console.log(CLIENTS);
    ws.on('message', function incoming(data) {
        console.log(data);
        updateGame(id, data);
    });

    ws.on('close', function () {
        delete CLIENTS[ws.upgradeReq.headers['sec-websocket-key']];
    });

    ws.send('connected!');

    console.log('WebSocket Server run in http://127.0.0.1:1414/');
});

function updateGame(id, actions){

}