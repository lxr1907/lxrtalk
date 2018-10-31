var socket = io.connect('http://'+document.domain+":8081");//www.lxrtalk.com
$(window).focus(function () {
    document.title = "聊聊";
});
var myname = "";
var MaxDisplayMessages = 20;
var MaxNameLength = 10;
$(function () {
    //var name = prompt("设置昵称：");
    //myname = name;
    //setMyname(name);
    $("#textDiv").hide();
    //预防网页劫持广告注入
    $("iframe").remove();
});
socket.on('news', function (data) {
    if (data.n == null) {
        data.n = myname;
    }
    //清除第一条
    if ($('#talkWin').children().length > MaxDisplayMessages) {
        $('#talkWin').children(":first").remove();
    }
    //打印历史消息
    if (data.l != null) {
        for (var i in data.l) {
            $('#talkWin').append('<div><span>' + htmlEncodeJQ(data.l[i].n) + "：" + htmlEncodeJQ(data.l[i].m) + '</span></div>');
        }
    }
    //提示连接成功
    $('#talkWin').append('<div>' + dataToStr(new Date(data.t), 'h:m') + ' <span>' + htmlEncodeJQ(data.n) + "：" + htmlEncodeJQ(data.m) + '</span></div>');
    //新消息提示
    document.title = "新消息！";
});
function sendBtnClick() {
    var message = $('#inputText').val();
    socket.emit('clientmessage', {m: 'broadcast', param: {text: message}});

    $('#talkWin').append('<div>' + dataToStr(new Date(), 'h:m') + ' <span class="mymessage">我</span>：<span>' + htmlEncodeJQ(message) + '</span></div>');
    //清除第一条
    if ($('#talkWin').children().length > MaxDisplayMessages) {
        $('#talkWin').children(":first").remove();
    }
    $('#inputText').val('');
    clearCheck();
}
function clearCheck() {
    var imgCount = $("img").length;
    var max = 18;
    if (imgCount >= max) {
        $('#talkWin').html("");
    }
}
document.onkeydown = keyDownSearch;
function keyDownSearch(e) {
    //
    var theEvent = e || window.event;
    var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
    if (code == 13) {
        sendBtnClick();
    }
}
function clearScreenClick() {
    $('#talkWin').html("");
}
/**
 * 设置昵称
 */
function setNameBtnClick() {
    var name = $("#myname").val();
    if (name == null || name.trim().length == 0) {
        return;
    }
    socket.emit('clientmessage', {m: 'setname', param: {text: name.trim().substring(0, MaxNameLength)}});
    $("#mynamediv").hide();
    $("#textDiv").show();
}

function htmlEncodeJQ(str) {
    return $('<span/>').text(str).html();
}
function dataToStr(datetime, format) {
    var date = {
        "M+": datetime.getMonth() + 1,
        "d+": datetime.getDate(),
        "h+": datetime.getHours(),
        "m+": datetime.getMinutes(),
        "s+": datetime.getSeconds(),
        "q+": Math.floor((datetime.getMonth() + 3) / 3),
        "S+": datetime.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}