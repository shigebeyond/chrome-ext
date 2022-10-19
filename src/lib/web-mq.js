import { io } from "socket.io-client";
import {publishLocalMq, subLocalMq} from './local-mq';
import modalBg from './modal-bg';
import store from './store';

// ---- 连接mq server ----
// mq server是基于websocket+redis+nodejs实现web端消息推送： https://gitee.com/shigebeyond/webredis
// 使用websocket连接mq server：参见sock.io API文档事件(Event)说明 https://socket.io/docs/client-api
var socket = null;
function connectMqServer(url) {
  console.log('连接消息服务器')
  var failNum = 0
  socket = io(url, {
    autoConnect: false // 延迟连接
  });
  // socket.id属性标识socket
  // console.log(socket)
  socket.on('reconnecting', function (attemptNumber) {
    console.log('尝试建立ws连接')
  });
  socket.on("error", (error) => {
    console.log('连接错误: ' + error)
  });
  socket.on('connect', function () {
    console.log('ws连接成功')
    modalBg.toast('ws连接成功')
  });
  socket.on('disconnect', function (reason) {
    console.log('断开ws连接:' + reason)
  });
  socket.on('reconnect', function (attemptNumber) {
    console.log('重新ws连接成功')
  });
  socket.on('reconnect_failed', function () {
    console.log('重连失败')
  });
  // 显示channel订阅显示消息  
  socket.on('message', handleWebMq);
  //显示请求响应
  socket.on('ack', function (ack) {
    console.log(ack.request + '响应:' + ack.respone + ':' + ack.reply);        
  });
  // 延迟连接
  socket.connect();
  return socket;
}

// 监听选项存储的变化: 主要是识别 mqServerUrl 变化， 以便重新连接
window.addEventListener('storage', reconnectMqServer, false);

// 重新连接
function reconnectMqServer(){
  if(socket == null) // 没连接过
    return
  
  // 读配置的 mqServerUrl
  let url = store.readOption('mqServerUrl')
  if(url == socket.io.uri){ // server没变
    console.log('消息服务器地址没变')
    return
  }

  console.log('消息服务器地址变化了，要重连: ' + url)
  // 连接
  connectMqServer(url);

  // 恢复监听
  for(let c in webMqCallbacks){
    let callback = webMqCallbacks[c]
    subWebMq(c, callback)
  }
}

// ---- 生产者者 ----
//向channel中发布消息
function publishWebMq(channel, data) {
  console.log('发布web消息: channel=' + channel + ', data=' + data);
  let msg = {
    data: data,
    fromSocketId: socket.id //传递 socketId，以便在收到消息时识别是不是本socket发的
  }
  socket.emit('publish', channel, JSON.stringify(msg));
}

// ---- 消费者 ----
var webMqCallbacks = {};//mq消费回调

// 处理收到的消息
function handleWebMq(message) {
  console.log('收到web消息:' + JSON.stringify(message));
  let c = message.channel;
  if(!c in webMqCallbacks){
    console.log('未订阅channel:' + c);
    modalBg.toast('未订阅channel:' + c)
    return;
  }

  let {data, fromSocketId} = JSON.parse(message.data)
  let own = fromSocketId == socket.id // 是否自己(本socket)发的消息

  // 调用消费回调
  let callback = webMqCallbacks[c]
  callback(data, own)
}

/**
 * 订阅channel
 *   同一个channel重复订阅，直接覆盖
 * @param channels
 * @param callback mq消费回调，接收2个参数: 1 mq数据 2 是否本socket, 可省参数
 */
function subWebMq(channels, callback) {
  if (typeof channels === 'string') {
    channels = [channels]
  }
  // 记录mq消费回调
  for (let c of channels){
    webMqCallbacks[c] = callback;
  }
  socket.emit('subscribe', channels);
}

//取消订阅channel
function unsubWebMq(channels) {
  if (typeof channels === 'string') {
    channels = [channels]
  }
  // 删除mq消费回调
  for (let c of channels){
    if(c in webMqCallbacks)
      delete webMqCallbacks[c];
  }

  socket.emit('unsubscribe', channels);
}

const wmqApi = {connectMqServer, reconnectMqServer, publishWebMq, subWebMq, unsubWebMq};
export default wmqApi;