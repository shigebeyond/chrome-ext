/* global chrome */
// 用于在background中 调用content_script引入的弹窗
import {subLocalMq} from './local-mq';

var _confirmParam = null;//confirm弹窗参数，用于记录回调
var modalBg = {
    toast: function(msg, time = 2){
        // 不好使
        //modal.toast(note, 2);
        // 好使
        chrome.tabs.executeScript(null, {
            code: `modal.toast('${msg}', ${time});`
        })
    },
    alert: function(title, msg){
        msg = msg.replace(/\n/g, "<br>").replace(/'/g, "\\'");
        // 好使
        chrome.tabs.executeScript(null, {
            code: `modal.alert('${title}', '${msg}');`
        });
    },
    /* 
    confirm弹窗
    modalBg.confirm({
          title:'confirm弹窗文案',
          message:'这是confirm弹窗,你确定删除吗?',
          confirm:function(){
                alert('您点击了确定')
          },
          cancel:function(){
                alert('您点击了取消')
          }
    })
    */
    confirm: function(obj){
        _confirmParam = obj; // 记录confirm弹窗参数
        obj.message = obj.message.replace(/\n/g, "<br>").replace(/'/g, "\\'");
        chrome.tabs.executeScript(null, {
            code: `modal.confirm('${obj.title}', '${obj.message}');`
        });
    },
};

// 监听消息: 接收 modal.js 发的消息, 处理确认框的结果消息
subLocalMq('modal-confirm', function(confirm_result){
    if(_confirmParam != null){
        // 回调
        if(confirm_result)
            _confirmParam.confirm && _confirmParam.confirm();
        else
            _confirmParam.cancel && _confirmParam.cancel();

        // 清理confirm弹窗参数
        _confirmParam = null;
    }
});

export default modalBg;