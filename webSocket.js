/**
 * Created by lxr on 2016/6/10.
 */
const express = require('express');
const path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var port = 8081;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(port);
var clientSockets = {};//
var messageHistory = [];
var userCount = 0;
var groupMap = {};
var MAX_GROUPS = 5;
io.on('connection', function (socket) {
    var addedUser = false;
    var User = {};
    User.socket = socket;
    User.myGroupMap = {};
    clientSockets[socket.id] = User;
    socket.emit('news', {m: '连接成功,在线人数:' + userCount, l: messageHistory, t: new Date()});
    socket.on('clientmessage', function (data) {
        delegateFuncs[data.m](data.param, socket);
        if (!addedUser) {
            addedUser = true;
            ++userCount;
        }
    });
    socket.on('disconnect', (reason) => {
        if (addedUser) {
            --userCount;
        }
        //从群中删除该用户
        for (var i in clientSockets[socket.id].myGroupMap) {
            //当群中没人时删除该群
            if (clientSockets[socket.id].myGroupMap[i].count == 0) {
                delete groupMap[clientSockets[socket.id].myGroupMap[i].groupName];
            }
            delete clientSockets[socket.id].myGroupMap[i].usersMap[socket.id];
        }
        delete clientSockets[socket.id];
    });
    socket.on('error', (error) => {
        //console.log(error);
    });
});
var delegateFuncs = {
    logfunction: function (param) {
        //console.log(param.text);
    },
    broadcast: function (param, socket) {
        var text = "";
        var maxLength = 2 * 1024 * 1024;//200KB
        if (param.text.length >= maxLength) {
            text = param.substr(maxLength);
        } else {
            text = param.text;
        }
        if (messageHistory.length >= 20) {
            messageHistory.shift();
        }
        var name = "匿名";
        //查找发送者设置的昵称
        name = clientSockets[socket.id].name;
        var date = new Date();
        //将内容发送至所有人
        for (var i in clientSockets) {
            if (clientSockets[i].socket !== socket) {
                clientSockets[i].socket.emit('news', {m: text, n: name, t: date});
            }
        }
        //记录发送内容到历史数据
        messageHistory.push({m: text, n: name});
    },
    sendToGroup: function (param, socket) {
        var groupName = param.g;
        if (clientSockets[socket.id].myGroupMap[groupName] == null) {
            //通知自己
            socket.emit('news', {
                m: " 失败，未加入该组！", g: groupName, t: new Date()
            });
            return;
        }
        var text = "";
        var maxLength = 2 * 1024 * 1024;//200KB
        if (param.text.length >= maxLength) {
            text = param.substr(maxLength);
        } else {
            text = param.text;
        }
        if (messageHistory.length >= 20) {
            messageHistory.shift();
        }
        var name = "匿名";
        //查找发送者设置的昵称
        name = clientSockets[socket.id].name;
        var date = new Date();
        //将内容发送至群组内
        var usersMap = clientSockets[socket.id].myGroupMap[groupName].usersMap;
        for (var i in usersMap) {
            if (clientSockets[i].socket !== socket) {
                usersMap[i].socket.emit('news', {m: text, n: name, t: date, g: groupName});
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
        for (var i in clientSockets) {
            if (clientSockets[i].socket !== socket) {
                //通知其他人有新人加入
                clientSockets[i].socket.emit('news', {m: " 加入了！", n: text, t: new Date()});
            } else {
                //设置自己昵称
                clientSockets[i].name = text;
            }
        }
    },
    foundGroup: function (param, socket) {
        //组名
        var groupName = param.groupName;
        //组密码
        var groupPwd = param.groupPwd;
        if (groupName.length >= 20) {
            groupName = groupName.substr(0, 20);
        }
        if (groupMap[groupName] != null) {
            socket.emit('news', {m: " 群组创建失败，名称重复！", t: new Date()});
            return;
        }
        if (groupPwd.length >= 20) {
            groupPwd = groupPwd.substr(0, 20);
        }
        //初始化群组的信息
        var group = {};
        //群名称
        group.groupName = groupName;
        //入群密码
        group.groupPwd = groupPwd;
        //群用户列表
        group.usersMap = {};
        //将自己先加入该群组
        group.usersMap[socket.id] = clientSockets[socket.id];
        //群成员数
        group.count = 1;
        //群主
        group.leader = clientSockets[socket.id];
        //群列表
        groupMap[group.groupName] = group;
        if (clientSockets[socket.id] != null) {
            //该用户加入的群列表，便于查询
            clientSockets[socket.id].myGroupMap[groupName] = group;
        }
        //通知所有人
        for (var i in clientSockets) {
            if (clientSockets[i].socket !== socket) {
                //通知其他人有新群组
                clientSockets[i].socket.emit('news', {m: " 群组创建：" + groupName, t: new Date()});
            } else {
                //通知自己
                socket.emit('joinGroupSuccess', {
                    m: " 群组创建成功！" + groupName,
                    g: groupName,
                    t: new Date()
                });
            }
        }
    },
    joinGroup: function (param, socket) {
        //组名
        var groupName = param.groupName;
        //组密码
        var groupPwd = param.groupPwd;
        if (groupName.length >= 20) {
            socket.emit('news', {m: " 群组加入失败，不存在该群！", t: new Date()});
            return;
        }
        if (groupMap[groupName] == null) {
            socket.emit('news', {m: " 群组加入失败，不存在该群！", t: new Date()});
            return;
        }
        if (groupMap[groupName].groupPwd !== groupPwd) {
            socket.emit('news', {m: " 群组加入失败，密码错误！", t: new Date()});
            return;
        }
        //通知群里其他人
        for (var i in groupMap[groupName].usersMap) {
            groupMap[groupName].usersMap[i].socket.emit('news', {
                m: "加入了该群",
                n: clientSockets[socket.id].name,
                g: groupName,
                t: new Date()
            });
        }
        //入群成功
        groupMap[groupName].usersMap[socket.id] = clientSockets[socket.id];
        groupMap[groupName].count++;
        //该用户加入的群列表，便于查询
        clientSockets[socket.id].myGroupMap[groupName] = groupMap[groupName];
        //通知自己
        socket.emit('joinGroupSuccess', {
            m: " 群组加入成功！" + groupName + "",
            g: groupName,
            t: new Date()
        });
    },
    quitGroup: function (param, socket) {
        //组名
        var groupName = param.groupName;
        delete groupMap[groupName].usersMap[socket.id];
        groupMap[groupName].count--;
        delete clientSockets[socket.id].myGroupMap[groupName];
        //通知自己
        socket.emit('news', {
            m: " 群组退出：" + groupName + "成功！",
            g: groupName,
            c: "quitGroupSuccess",
            t: new Date()
        });
        //通知群里其他人
        for (var i in groupMap[groupName].usersMap) {
            groupMap[groupName].usersMap[i].emit('news', {m: "加入了该群", n: clientSockets[socket.id].name, t: new Date()});
        }
    }
}