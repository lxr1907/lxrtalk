/**
 * Created by lxr on 2016/6/10.
 */
var log4js = require("log4js");
log4js.configure({
    appenders: {
        ruleConsole: {type: 'console'},
        ruleFile: {
            type: 'dateFile',
            filename: 'logs/lxrtalk-',
            pattern: 'yyyy-MM-dd.log',
            maxLogSize: 10 * 1000 * 1000,
            numBackups: 3,
            alwaysIncludePattern: true
        }
    },
    categories: {
        default: {appenders: ['ruleConsole', 'ruleFile'], level: 'info'}
    }
});
const express = require('express');
const path = require('path');
var app = express();
var port = 8081;
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.attach(server, {
    maxHttpBufferSize: 10e8
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(__dirname + '/'));
server.listen(port);
var clientList = [];//
var messageHistory = [];
io.sockets.on('connection', function (socket) {
    var User = {};
    User.socket = socket;
    clientList.push(User);
    socket.emit('news', {m: '连接成功', l: messageHistory, t: new Date()});
    socket.on('clientmessage', function (data) {
        //console.log(data.m);
        //console.log(data.param);
        delegateFuncs[data.m](data.param, socket);
    });
});
var delegateFuncs = {
    logfunction: function (param) {
        //console.log(param.text);
    },
    broadcast: function (param, socket) {
        var text = "";
        text = param.text;
        if (messageHistory.length >= 20) {
            messageHistory.shift();
        }
        var name = "匿名";
        //查找发送者设置的昵称
        for (var i in clientList) {
            if (clientList[i].socket === socket) {
                name = clientList[i].name;
            }
        }
        var date = new Date();
        //将内容发送至所有人
        for (var i in clientList) {
            if (clientList[i].socket !== socket) {
                clientList[i].socket.emit('news', {m: text, n: name, t: date});
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
        for (var i in clientList) {
            if (clientList[i].socket !== socket) {
                //通知其他人有新人加入
                clientList[i].socket.emit('news', {m: " 加入了！", n: text, t: new Date()});
            } else {
                //设置自己昵称
                clientList[i].name = text;
            }
        }
    }
}