var express = require("express")
var app = express()
var http = require('http')
var child_process = require('child_process')
var path = require('path')

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/frontend/index.html'));
})

var server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', function (socket) {
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

server.listen(3000, () => {
    console.log('listening on *:3000');
});

crawlerPath = 
    'python ' + path.join(process.cwd(), '../python/main.py');
    // path.join(process.cwd(), 'bin/crawler.exe');
console.log(crawlerPath)
child_process.exec(crawlerPath, (error, stdout, stderr)=> {
    if (error) {
        console.log(error);
    }
    if (stdout) {
        console.log(stdout);
    }
})

var url = 'http://localhost:3000';
var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
child_process.exec(start + ' ' + url);

function SetClientSocket(socket)
{
    console.log("Hello client")
    clientSocket = socket

    socket.on('command', function (data,callback) {
        console.log(data)
        switch(data.type)
        {
            case 'cancel_crawler':
            case 'start_crawler':
                crawlerSocket.emit("command", {type: data.type, args: data.args})
                break
        }
        callback()
    })
}

function SetCrawlerSocket(socket)
{
    console.log("Hello crawler ")
    crawlerSocket = socket
    socket.on('finish', function (data) {
        clientSocket.emit("crawler_result",data)
    })
    socket.on('progress', function (data) {
        clientSocket.emit("crawler_progress", data)
    })
    socket.on('log', function (data) {
        console.log("crawler log: " + data)
    })
}