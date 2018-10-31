/**
 * Created by lxr on 2016/6/10.
 */

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs');
app.listen(8080);
io.set('log level', 1);//

var clientList = [];//
var messageHistory = [];
function handler(req, res) {
    fs.readFile(__dirname + '/html/index.html', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
}
io.sockets.on('connection', function (socket) {
    var User = {};
    User.socket = socket;
    clientList.push(User);
    socket.emit('news', {m: '连接成功', l: messageHistory,t:new Date()});
    socket.on('clientmessage', function (data) {
        console.log(data.m);
        console.log(data.param);
        delegateFuncs[data.m](data.param, socket);
    });
});
var delegateFuncs = {
    logfunction: function (param) {
        console.log(param.text);
    },
    broadcast: function (param, socket) {
        var text = "";
        if (param.text.length >= 200) {
            text = param.substr(200);
        } else {
            text = param.text;
        }
        if (messageHistory.length >= 5) {
            messageHistory.shift();
        }
        var name = "匿名";
        //查找发送者设置的昵称
        for (var i in clientList) {
            if (clientList[i].socket === socket) {
                name = clientList[i].name;
            }
        }
        var date=new Date();
        //将内容发送至所有人
        for (var i in clientList) {
            if (clientList[i].socket !== socket) {
                clientList[i].socket.emit('news', {m: text, n: name,t:date});
            }
        }
        //记录发送内容到历史数据
        messageHistory.push({m: text, n: name});
    },
    setname: function (param, socket) {
        var text = "";
        if (param.text.length >= 20) {
            text = param.substr(20);
        } else {
            text = param.text;
        }
        var myi = 0;
        var hasName = false;
        for (var i in clientList) {
            if (clientList[i].socket !== socket) {
                clientList[i].socket.emit('news', {m: " 加入了！", n: text,t:new Date()});
            } else {
                myi = i;
            }
            if (clientList[i].name == text) {
                hasName = true;
            }
        }
        if (hasName) {
            text = text + Math.ceil(Math.random() * 100);
        }
        clientList[i].name = text;
    }
}