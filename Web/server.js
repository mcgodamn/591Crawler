// var express = require("express")
// var app = express()
// var http = require('http')
// app.use(express.static("./public"))
// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/index.html');
// })


// var server = http.createServer(app).listen(3000)
// var server_socket = require('socket.io')(server)

// server_socket.on('connection', function (socket) {
//     socket.on('python-message', function (data) {
//         socket.broadcast.emit('message', data)
//     })
// })

var express = require("express");
var app = express();
var http = require("http");
app.use(express.static("./public")); // where the web page code goes
var http_server = http.createServer(app).listen(3000);
var http_io = require("socket.io")(http_server);

http_io.on("connection", function (httpsocket) {
    httpsocket.on('python-message', function (fromPython) {
        console.log(fromPython)
        httpsocket.broadcast.emit('node_response', fromPython);
    });
});