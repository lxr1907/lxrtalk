function foundGroupClick() {
    //组名
    var groupName = $('#groupName').val();
    //组密码
    var groupPwd = $('#groupPwd').val();
    socket.emit('clientmessage', {m: 'foundGroup', param: {groupName: groupName, groupPwd: groupPwd}});
}

function joinGroupClick() {
    //组名
    var groupName = param.groupName;
}

function quitGroup() {
    //组名
    var groupName = param.groupName;
}