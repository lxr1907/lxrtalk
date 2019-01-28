function foundGroupClick() {
    //组名
    var groupName = $('#groupName').val();
    //组密码
    var groupPwd = $('#groupPwd').val();
    socket.emit('clientmessage', {m: 'foundGroup', param: {groupName: groupName, groupPwd: groupPwd}});
}

function joinGroupClick() {
    var groupName = $('#groupName').val();
    var groupPwd = $('#groupPwd').val();
    socket.emit('clientmessage', {m: 'joinGroup', param: {groupName: groupName, groupPwd: groupPwd}});
}

function quitGroup() {
    var groupName = $('#groupName').val();
    socket.emit('clientmessage', {m: 'quitGroup', param: {groupName: groupName}});
}

function sendToGroup() {
    var groupName = $('#groupName').val();
    var text = $('#inputText').val();
    socket.emit('clientmessage', {m: 'sendToGroup', param: {groupName: groupName, text: text}});
}

$(function () {
    var tabs = document.getElementsByClassName('tab-head')[0].getElementsByTagName('input');
    for (var i = 0, len = tabs.length; i < len; i++) {
        tabs[i].onclick = showTab;
    }

});


function showTab() {
    var tabs = document.getElementsByClassName('tab-head')[0].getElementsByTagName('input'),
        contents = document.getElementsByClassName('tab-content')[0].getElementsByTagName('div');
    for (var i = 0, len = tabs.length; i < len; i++) {
        if (tabs[i] === this) {
            tabs[i].className = 'selected';
            contents[i].className = 'show';
        } else {
            tabs[i].className = '';
            contents[i].className = '';
        }
    }
}
