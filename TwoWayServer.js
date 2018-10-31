// 在前者的基础上，实现 Client --> Sever 的通讯，如此一来便是双向通讯
var net = require('net');
var chatServer = net.createServer(),
    clientList = [];//已连接的client列表
var buffer=new Buffer(0);
chatServer.on('connection', function(client) {
    // name 的自定义属性，用于表示哪个客户端（客户端的地址+端口为依据）
    client.name = client.remoteAddress + ':' + client.remotePort;
    client.write('Hi ' + client.name + '!\n');
    clientList.push(client);
    client.on('data', function(data) {
        console.log(data);
        console.log(buffer);
        if(data.equals(new Buffer([0x0d,0x0a]))){
            broadcast(buffer, client);// 接受来自客户端的信息
            buffer=new Buffer(0);
        }else{
            var buflist=[buffer,data];
            buffer=Buffer.concat(buflist,buffer.length+data.length);
        }

    });
    client.on('end', function() {
        clientList.splice(clientList.indexOf(client), 1); // 删除数组中的制定元素。这是 JS 基本功哦~
    });
    client.on('error', function(e) {
        console.log(e);
    });
});
function broadcast(message, client) {
    var cleanup = [];
    for(var i=0;i<clientList.length;i+=1) {
        if(client !== clientList[i]) {
            if(clientList[i].writable) { // 先检查 sockets 是否可写
                var msg=client.name + " says " + message;
                console.log(msg);
                clientList[i].write(msg);
            } else {
                cleanup.push(clientList[i]) // 如果不可写，收集起来销毁。销毁之前要 Socket.destroy() 用 API 的方法销毁。
                clientList[i].destroy()
            }
        }
    }
    for(i=0;i<cleanup.length;i+=1) {
        clientList.splice(clientList.indexOf(cleanup[i]), 1)
    }
}
chatServer.listen(9000);
