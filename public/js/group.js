var selectedGroup = "talkWin";//大厅默认0
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

function joinGroupSuccess(data) {
    var groupTabName = data.g;
    if (groupTabName.length > 10) {
        groupTabName = groupTabName.substr(0, 10) + "...";
    }
    var tabHead = '<input id="groupTab' + data.g + '" name="' + data.g + '" type="button" value="' + groupTabName + '"/>';
    var tabBody = '<div class="show" id="groupWin' + data.g + '"></div>';
    $(".tab-head").append(tabHead);
    $(".tab-content").append(tabBody);
    bindGroupTabOnclick();
}

function quitGroup() {
    var groupName = $('#groupName').val();
    socket.emit('clientmessage', {m: 'quitGroup', param: {groupName: groupName}});
}

function sendToGroup() {
    var text = $('#inputText').val();
    socket.emit('clientmessage', {m: 'sendToGroup', param: {g: selectedGroup, text: text}});
}

$(function () {
    bindGroupTabOnclick();
});

function bindGroupTabOnclick() {
    var tabs = document.getElementsByClassName('tab-head')[0].getElementsByTagName('input');
    for (var i = 0, len = tabs.length; i < len; i++) {
        tabs[i].onclick = showTab;
    }
}

function showTab() {
    var tabs = document.getElementsByClassName('tab-head')[0].getElementsByTagName('input'),
        contents = document.getElementsByClassName('tab-content')[0].getElementsByTagName('div');
    for (var i = 0, len = tabs.length; i < len; i++) {
        if (tabs[i] === this) {
            tabs[i].className = 'selected';
            selectedGroup = tabs[i].getAttribute("name");
            $("#groupWin" + selectedGroup).show();
        } else {
            tabs[i].className = '';
            var hideGroupName = tabs[i].getAttribute("name");
            $("#groupWin" + hideGroupName).hide();
        }
    }
}
