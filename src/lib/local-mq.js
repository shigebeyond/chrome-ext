/* global chrome */
import $ from "jquery";

// ---- 生产者者 ----
//发布本地消息
function publishLocalMq(channel, data) {
	var mq = {}
	mq[channel] = data
    console.log('发布本地消息: channel=' + channel + ', data=' + data);
	chrome.extension.sendRequest(mq, function(response) {
		console.log(response.farewell);
	});
}

// ---- 消费者 ----
var localMqCallbacks = {};//mq消费回调
/**
 * 订阅channel
 *   同一个channel重复订阅，直接覆盖
 * @param channels
 * @param callback mq消费回调，接收1个参数: mq数据
 */
function subLocalMq(channels, callback) {
  if (typeof channels === 'string') {
    channels = [channels]
  }
  // 首次添加listener
  if($.isEmptyObject(localMqCallbacks)){
    // 监听消息
    chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
        let src = sender.tab ? 'content script:' + sender.tab.url : 'extension'
        console.log("收到本地消息: " + JSON.stringify(req) + '; 来自' + src);
        
        // channel
        let c = Object.keys(req)[0];

        // 调用消费回调
        let callback = localMqCallbacks[c]
        let ret = callback(req[c])
        if(typeof(ret) == "undefined")
            ret = {}

        sendResponse(ret);
    });
  }
  // 记录mq消费回调
  for (let c of channels){
    localMqCallbacks[c] = callback;
  }
}

export {
    publishLocalMq,
    subLocalMq
}