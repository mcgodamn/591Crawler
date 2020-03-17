var express = require("express")
var app = express()
var http = require('http')
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/frontend/index.html');
})

var server = http.createServer(app).listen(3000)
var server_socket = require('socket.io')(server)

server_socket.on('connection', function (socket) {
    socket.on('whoamI', function (data) {
        console.log(data)
        switch (data) {
            case "client":
                SetClientSocket(socket)
                break;
            case "crawler":
                SetCrawlerSocket(socket)
                break;
            default:
                break;
        }
    })
})

function SetClientSocket(socket)
{
    console.log("Hello client")
    clientSocket = socket

    socket.on('command', function (data,callback) {
        console.log(data.type)
        switch(data.type)
        {
            case 'start_crawler':
                crawlerSocket.emit("command", { type: data.type, args: data.args})
                break
        }
        callback()
    })
}

function SetCrawlerSocket(socket)
{
    console.log("Hello crawler")
    crawlerSocket = socket
    socket.on('finish', function (data) {
        clientSocket.emit("crawler_result",data)
    })
}