function socket() {
  this.socket = null;
  this.host = "ws://localhost:12345/websocket/server.php";

  try {
    this.socket = new WebSocket(this.host);
    DEBUG('初始化WebSocket');

    /////////
    this.socket.onopen    = function(msg) { 
      DEBUG("已连接"); 
    };

    ////////
    this.socket.onmessage = function(resp) { 
      var response = resp.data;
      DEBUG('收到回复：' + response);

      // 返回值不以[OK]开头，说明有问题
      if( response.indexOf('[OK]') !== 0 ) {
          MSG('弹幕发送失败 : ' + response);
          return false;
      }

      // 没有问题就把弹幕插进队列
      // 还原出object
      response = response.substr(4);
      var danmaku = unserialize(response);
      if( !danmaku ) {
        MSG('返回值无法解析');
        return false;
      }

      // 一些应该是数字的数据
      danmaku.color = parseInt(danmaku.color);
      danmaku.date = parseInt(danmaku.date);
      danmaku.mode = parseInt(danmaku.mode);
      danmaku.size = parseInt(danmaku.size);
      danmaku.stime = parseInt(danmaku.stime);


      // 判断是否是本人发的
      if( danmaku['user'] == getCookie('user') ) {
        danmaku.isNew = true;
        // 清空输入框
        document.querySelector('#danmaku-text').value = '';
        // 提示成功
        MSG('弹幕发送成功');
      }

      // 插入！
      DANMAKU.insert(danmaku);
    };

    ////////
    this.socket.onclose   = function(msg) { 
      DEBUG("已断开：" + this.readyState); 
    };


  } catch(ex) { 
    MSG(ex); 
  }

}

socket.prototype.send = function(msg) {
    if( !msg ) return; 

    try { 
      this.socket.send(msg); 
      DEBUG('发送：' + msg); 
    } catch(ex) { 
      DEBUG(ex); 
    }
  }

socket.prototype.quit = function() {
  this.socket.close();
  this.socket = null;
}