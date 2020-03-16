var express = require("express")
var app = express()
var http = require('http')
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/frontend/index.html');
})
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var crawleRequest
var pythonSocket

app.post('/command', urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400)
    console.log(req.body);
    if (req.body.event == "StartCrawler") {
        console.log("lets start crawler");
        crawleRequest = res
        pythonSocket.emit("start", "it's my args.")
    }
})

var server = http.createServer(app).listen(3000)
var server_socket = require('socket.io')(server)

server_socket.on('connection', function (socket) {
    socket.on('finish', function (data) {
        crawleRequest.send(data)
    })

    pythonSocket = socket
})