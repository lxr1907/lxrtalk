var socket = io();//www.lxrtalk.com
document.addEventListener('visibilitychange', function () {
    var isHidden = document.hidden;
    if (isHidden) {
    } else {
        document.title = "聊聊";
    }
});
var defaultName = "";
//已加入的分组列表
var myGroupMap = {};
var MaxDisplayMessages = 20;
var MaxNameLength = 10;
$(function () {
    $("#textDiv").hide();
    //预防网页劫持广告注入
    $("iframe").remove();
});

function setLocalStorate(key, val) {
    var storage = window.localStorage;
    storage[key] = val;
}

function getLocalStorate(key, val) {
    var storage = window.localStorage;
    return storage[key];
}

socket.on('connect', function () {
    var myName = getLocalStorate("myName");
    //根据缓存直接设置自己的昵称
    if (myName != null && myName.length != 0) {
        setMyName(myName);
    }
});
socket.on('news', function (data) {
    if (data.n == null) {
        data.n = defaultName;
    }

    //打印历史消息
    if (data.l != null) {
        $('#groupWin' + defultWin).html("");
        for (var i in data.l) {
            if (data.l[i].m.length > 200 && data.l[i].m.indexOf("data:image") != -1) {
                createNameSpan(data.l[i]);
                createImg(data.l[i].m);
            } else if (data.l[i].m.length > 200 && data.l[i].m.indexOf("data:video") != -1) {
                createNameSpan(data.l[i]);
                createVideo(data.l[i].m);
            } else {
                createText(data.l[i]);
            }
        }
    }
    //有组名发到分组，没有则组名为默认组

    if (data.g == null) {
        data.g = defultWin;
    }
    if (data.m.indexOf("data:image") != -1) {
        createImg(data);
    } else if (data.m.indexOf("data:video") != -1) {
        createVideo(data);
    } else {
        createText(data)
    }
    //调整每个tab的消息可见性
    resetTab();
    //新消息提示
    document.title = "新消息！";
    if (data.g != defultWin) {
        newMessageTabCss(data.g);
    }
});

//有新消息的群tab变为粉色
function newMessageTabCss(groupName) {
    var tabs = document.getElementsByClassName('tab-head')[0].getElementsByTagName('input');
    for (var i = 0, len = tabs.length; i < len; i++) {
        if (groupName === tabs[i].getAttribute("name")) {
            tabs[i].className = 'message';
        }
    }
}

socket.on('joinGroupSuccess', function (data) {
    joinGroupSuccess(data);
});

function createText(data) {
    var timeStr = "";
    if (data.t != null) {
        timeStr = dataToStr(new Date(data.t), 'h:m');
    }
    //有组名发到分组，没有则组名为默认组
    if (data.g == null) {
        data.g = defultWin;
    }
    $('#groupWin' + data.g).append('<div>' + timeStr + ' <span>' + htmlEncodeJQ(data.n) + "：" + htmlEncodeJQ(data.m) + '</span></div>');
    cleanFirstIfReachMax('#groupWin' + data.g);
}

function cleanFirstIfReachMax(tag) {
    //清除第一条
    if ($(tag).children().length > MaxDisplayMessages) {
        $(tag).children(":first").remove();
    }
}

function createImg(data) {
    createNameSpan(data);
    var img = new Image();//创建img容器
    img.src = data.m;//给img容器引入base64的图片
    img.style.width = "60px";
    img.style.height = "60px";
    $(img).click(function () {
        imgShow(img);
    });
    $('#groupWin' + data.g).append(img);
}

function createVideo(data) {
    createNameSpan(data);
    var videoData = data.m;
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf("Safari") > -1) {
        createImg(data);
        return;
    }
    var video = document.createElement('video');//创建video容器
    video.src = videoData;//给video容器引入base64的数据
    video.style.width = "60px";
    video.style.height = "60px";
    $(video).click(function () {
        videoShow(video);
    });
    $('#groupWin' + data.g).append(video);
}

function createNameSpan(data) {
    var name = data.n;
    var nameSpan = "";
    if (name != null && name.length != 0) {
        nameSpan = '<span>' + htmlEncodeJQ(name) + "：</span>";
    }
    $('#groupWin' + data.g).append('<div>' + nameSpan + '</div>');
}

function sendBtnClick() {
    var message = $('#inputText').val();
    if (selectedGroup == defultWin) {
        socket.emit('clientmessage', {m: 'broadcast', param: {text: message}});
    } else {
        sendToGroup();
    }
    $('#groupWin' + selectedGroup).append('<div>' + dataToStr(new Date(), 'h:m') + ' <span class="mymessage">我</span>：<span>' + htmlEncodeJQ(message) + '</span></div>');
    //清除第一条
    if ($('#groupWin' + selectedGroup).children().length > MaxDisplayMessages) {
        $('#groupWin' + selectedGroup).children(":first").remove();
    }
    $('#inputText').val('');
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

/**
 * 设置昵称
 */
function setNameBtnClick() {
    var name = $("#myname").val();
    setMyName(name);
}

function setMyName(name) {
    if (name == null || name.trim().length == 0) {
        return;
    }
    name = name.trim().substring(0, MaxNameLength);
    socket.emit('clientmessage', {m: 'setname', param: {text: name}});
    hideSetNameArea();
    setLocalStorate("myName", name);
}

function hideSetNameArea() {
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