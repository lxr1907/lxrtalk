$(function () {
    /*思路：
     *1.熟悉文件拖拽 目标元素 的四个事件,注意:ondragover、ondrop事件中阻止默认行为
     *2.拖拽放置后，获取到文件对象集合：e.dataTransfer.files
     *3.循环该集合中的每个文件对象，判断文件类型以及文件大小，是指定类型则进行相应的操作
     *4.读取文件信息对象：new FileReader()，它有读取文件对象为DataUrl等方法：readAsDataURL(文件对象)、读取成功之后触发的事件：onload事件等，this.result为读取到的数据
     *5.在FileReader对象中的几个事件中进行相应的逻辑处理
     *
     */

    //必须将jq对象转换为js对象，调用原生方法
    var oDiv = $(".container").get(0);
    var oDiv2 = $(".containerVideo").get(0);
    //移动，需要阻止默认行为，否则直接在本页面中显示文件
    oDiv.ondragover = function (e) {
        e.preventDefault();
    }

    function uploadFile(file) {
        //文件类型
        var _type = file.type;
        //判断文件类型
        if (_type.indexOf('image') != -1 || _type.indexOf('video') != -1) {
            //文件大小控制
            console.log("文件大小：" + file.size);
            //读取文件对象
            var reader = new FileReader();
            //读为DataUrl,无返回值
            reader.readAsDataURL(file);
            //当读取成功时触发，this.result为读取的文件数据
            reader.onload = function () {
                //文件数据
                console.log("上传成功，长度" + this.result.length);
                //发送文件
                var message = this.result;
                socket.emit('clientmessage', {m: 'broadcast', param: {text: message}});
                if (_type.indexOf('image') != -1) {
                    createImg("我", message);
                } else if (_type.indexOf('video') != -1) {
                    createVideo("我", message);
                }
            }
        } else {
            alert('请上传图片,或视频文件！');
        }
    }

    //拖拽放置，也需要阻止默认行为
    function dropFile(e) {
        e.preventDefault();
        //获取拖拽过来的对象,文件对象集合
        var fs = e.dataTransfer.files;
        //若为表单域中的file标签选中的文件，则使用form[表单name].files[0]来获取文件对象集合
        uploadFile(fs[0]);
    }

    oDiv.ondrop = function (e) {
        dropFile(e);
    }
    oDiv2.ondrop = function (e) {
        dropFile(e);
    }

    function uploadSend(name) {
        // 上传image
        var reads = new FileReader();
        file = document.getElementById(name).files[0];
        uploadFile(file);
    }

    $("#imageBtn").change(function () {
        uploadSend('imageBtn');
    });
    $("#videoBtn").change(function () {
        uploadSend('videoBtn');
    });
    $(".container").click(function () {
        $("#imageBtn").click();
    });
    $(".containerVideo").click(function () {
        $("#videoBtn").click();
    });
});

