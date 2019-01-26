var socket = io();//www.lxrtalk.com
document.addEventListener('visibilitychange', function () {
    var isHidden = document.hidden;
    if (isHidden) {
    } else {
        document.title = "聊聊";
    }
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
        data.n = "";
    }
    //清除第一条
    if ($('#talkWin').children().length > MaxDisplayMessages) {
        $('#talkWin').children(":first").remove();
    }
    //打印历史消息
    if (data.l != null) {
        $('#talkWin').html("");
        //showHistoryList(data.l);
    }
    if (data.m.indexOf("data:image") != -1) {
        createNameSpan(data.n);
        createImg(data.m);
    } else if (data.m.indexOf("data:video") != -1) {
        createNameSpan(data.n);
        createVideo(data.m);
    } else {
        createText(data)
    }
    //新消息提示
    document.title = "新消息！";
});

function showHistoryList(dataList) {
    for (var i in dataList) {
        if (dataList[i].m.length > 200 && dataList[i].m.indexOf("data:image") != -1) {
            createNameSpan(dataList[i].n);
            createImg(dataList[i].m);
        } else if (dataList[i].m.length > 200 && dataList[i].m.indexOf("data:video") != -1) {
            createNameSpan(dataList[i].n);
            createVideo(dataList[i].m);
        } else {
            createText(dataList[i]);
        }
    }
}

function createText(data) {
    var timeStr = "";
    if (data.t != null) {
        timeStr = dataToStr(new Date(data.t), 'h:m');
    }
    //解密文本
    data.m = getDAesString(data.m, data.n);
    $('#talkWin').append('<div>' + timeStr + ' <span>' + htmlEncodeJQ(data.n) + "：" + htmlEncodeJQ(data.m) + '</span></div>');
}

function createImg(imgData) {
    var img = new Image();//创建img容器
    img.src = imgData;//给img容器引入base64的图片
    img.style.width = "60px";
    img.style.height = "60px";
    $(img).click(function () {
        imgShow(img);
    });
    $('#talkWin').append(img);
}

function createVideo(videoData) {
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf("Safari") > -1) {
        createImg(videoData);
        return;
    }
    var video = document.createElement('video');//创建video容器
    video.src = videoData;//给video容器引入base64的数据
    video.style.width = "60px";
    video.style.height = "60px";
    $(video).click(function () {
        videoShow(video);
    });
    $('#talkWin').append(video);
}

function createNameSpan(name) {
    var nameSpan = "";
    if (name != null && name.length != 0) {
        nameSpan = '<span>' + htmlEncodeJQ(name) + "：</span>";
    }
    $('#talkWin').append('<div>' + nameSpan + '</div>');
}

function sendBtnClick() {
    var message = $('#inputText').val();
    //加密文本
    messageAes = getAesString(message, myname);
    socket.emit('clientmessage', {m: 'broadcast', param: {text: messageAes}});

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
    myname = name;
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

//文本加密解密
function getAesString(data, keyStr) {//加密
    if (keyStr == null || keyStr.length == 0) {
        return data;
    }
    var ciphertext = CryptoJS.AES.encrypt(data, keyStr).toString();
    return ciphertext;    //返回的是base64格式的密文
}

function getDAesString(ciphertext, keyStr) {//解密
    if (keyStr == null || keyStr.length == 0) {
        return ciphertext;
    }
    var bytes = CryptoJS.AES.decrypt(ciphertext, keyStr);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
}