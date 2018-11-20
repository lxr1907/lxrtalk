var socket = io.connect('http://' + document.domain + ":8081");//www.lxrtalk.com
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
            if (data.l[i].m.length > 200 && data.l[i].m.indexOf("data:image") != -1) {
                createImg(data.l[i].n, data.l[i].m);
            } else if (data.l[i].m.length > 200 && data.l[i].m.indexOf("data:video") != -1) {
                createVideo(data.l[i].n, data.l[i].m);
            } else {
                createText(data.l[i]);
            }
        }
    }
    if (data.m.indexOf("data:image") != -1) {
        createImg(data.n, data.m);
    } else if (data.m.indexOf("data:video") != -1) {
        createVideo(data.n, data.m);
    } else {
        createText(data)
    }
    //新消息提示
    document.title = "新消息！";
});

function createText(data) {
    $('#talkWin').append('<div>' + dataToStr(new Date(data.t), 'h:m') + ' <span>' + htmlEncodeJQ(data.n) + "：" + htmlEncodeJQ(data.m) + '</span></div>');
}

function createImg(name, imgData) {
    var img = new Image();//创建img容器
    img.src = imgData;//给img容器引入base64的图片
    img.style.width = "60px";
    img.style.height = "60px";
    $(img).click(function () {
        imgShow(img);
    });
    $('#talkWin').append('<div><span>' + htmlEncodeJQ(name) + "：" + '</span></div>');
    $('#talkWin').append(img);
}

function createVideo(name, videoData) {
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf("Safari") > -1) {
        createImg(name, videoData);
        return;
    }
    var video = document.createElement('video');//创建video容器
    video.src = videoData;//给video容器引入base64的数据
    video.style.width = "60px";
    video.style.height = "60px";
    $(video).click(function () {
        videoShow( video);
    });
    $('#talkWin').append('<div><span>' + htmlEncodeJQ(name) + "：" + '</span></div>');
    $('#talkWin').append(video);
}

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


function imgShow(_this) {
    var width_now = $(_this).width();//获取当前点击的pimg元素中的src属性
    var smallImageWidth = 60;
    if (width_now != smallImageWidth) {
        $(_this).width(smallImageWidth + "px");
        $(_this).height(_this.naturalHeight * smallImageWidth / _this.naturalWidth + "px");
    } else {
        if (document.body.clientWidth >= _this.naturalWidth) {
            $(_this).width(_this.naturalWidth + "px");
            $(_this).height(_this.naturalHeight + "px");
        } else {
            $(_this).width(document.body.clientWidth + "px");
            $(_this).height(_this.naturalHeight * document.body.clientWidth / _this.naturalWidth + "px");
        }
    }
}
function videoShow(_this) {
    var width_now = $(_this).width();//获取当前点击的pimg元素中的src属性
    var smallImageWidth = 60;
    if (width_now != smallImageWidth) {
        $(_this).width(smallImageWidth + "px");
        $(_this).height(_this.videoHeight * smallImageWidth / _this.videoWidth + "px");
        _this.pause();
    } else {
        if (document.body.clientWidth >= _this.videoWidth) {
            $(_this).width(_this.videoWidth + "px");
            $(_this).height(_this.videoHeight + "px");
        } else {
            $(_this).width(document.body.clientWidth + "px");
            $(_this).height(_this.videoHeight * document.body.clientWidth / _this.videoWidth + "px");
        }
        _this.play();
    }
}