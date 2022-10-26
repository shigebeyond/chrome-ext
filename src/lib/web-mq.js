import { io, Manager } from "socket.io-client";
import {publishLocalMq, subLocalMq} from './local-mq';
import modalBg from './modal-bg';
import store from './store';
import { splitDomainAndPath } from './util';

// ---- 连接mq server ----
// mq server是基于websocket+redis+nodejs实现web端消息推送： https://gitee.com/shigebeyond/webredis
// 使用websocket连接mq server：参见sock.io API文档事件(Event)说明 https://socket.io/docs/client-api
var socket = null;
function connectMqServer(url, callback) {
  if(socket != null && socket.connected){
    let msg = '已有连接: ' + socket.id
    console.log(msg)
    modalBg.toast(msg)
    return
  }
  console.log('开始连接消息服务器')

  let [domain, path] = splitDomainAndPath(url)
  const reconnectionAttempts = 0 // 最大重连次数，若要配合调用 callback 则要设为0
  const manager = new Manager(domain, {
    autoConnect: false,
    reconnectionAttempts
  });
  socket = manager.socket(path || '/');
  // socket.id属性标识socket
  // console.log('创建socket: ' + JSON.stringify(socket))
  
  // manager负责重连的事件, 参考 manager源码中的 this.emitReserved(事件名) 调用, 事件有 error/open/ping/packet/error/close/reconnect_failed/reconnect_attempt/reconnect_error/reconnect
  manager.on('reconnect_attempt', function (attemptNumber) {
    console.log(`第${attemptNumber}次尝试重连`)
  });
  manager.on('reconnect', function (attemptNumber) {
    console.log(`第${attemptNumber}次重连成功`)
  });
  manager.on('reconnect_failed', function () {
    let msg = '重连失败次数到 ' + reconnectionAttempts + '次，停止重连并关闭连接'
    console.log(msg)
    modalBg.toast(msg)
    socket.close()
  });
  manager.on('reconnect_error', function (err) {
    console.log(`单次重连错误: ${err}`)
  });

  // socket事件, 参考 socket源码中的 this.emitReserved(事件名) 调用, 事件有 connect/connect_error/disconnect
  socket.on('connect', function () {
    console.log('ws连接成功: ' + socket.id)
  });
  socket.on('connect_error', function (err) {
    console.log(`连接错误: ${err}`)
  });
  socket.on('disconnect', function (reason) {
    console.log('断开ws连接:' + reason)
  });
  // 显示channel订阅显示消息  
  socket.on('message', handleWebMq);
  //显示请求响应
  socket.on('ack', function (ack) {
    console.log(ack.request + '响应:' + ack.respone + ':' + ack.reply);        
  });
  // 连接方式1，但无回调，而 socket.connect() = socket.subEvents() + Manager.open()
  // socket.connect()
  // 连接方式2, 有(失败)回调
  socket.subEvents()
  manager.open((err) => { 
    let msg = ''
    if (err) {
      // an error has occurred
      msg = `首次连接错误: ${err} => `
      if(reconnectionAttempts >= 1){ // 重连
        msg += '重连'
        manager.maybeReconnectOnOpen()
      }else{
        msg += '不重连'
      }
    } else {
      // the connection was successfully established
      msg = '首次ws连接成功: ' + socket.id
      if(!socket.connected){
        socket.onconnect() // 标记连接成功
      }
      if(callback){
        callback()
      }
    }
    console.log(msg)
    if (err) {
      modalBg.confirm({
        title: '连接错误',
        message: msg + ';\n请确保你启动了消息服务器，了解详情?',
        confirm:function(){
          window.open('https://gitee.com/shigebeyond/webredis', "消息服务器", "");
        },
      })
    }else{
      modalBg.toast(msg)
    }
  });
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
  connectMqServer(url, resubMq);
}

// 恢复监听
function resubMq(){
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
    let msg = '未订阅channel:' + c
    console.log(msg);
    modalBg.toast(msg)
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