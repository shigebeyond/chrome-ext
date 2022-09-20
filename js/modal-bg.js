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
    this.confirm({
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
        obj.msg = obj.msg.replace(/\n/g, "<br>").replace(/'/g, "\\'");
        chrome.tabs.executeScript(null, {
            code: `modal.confirm('${obj.title}', '${obj.msg}');`
        });
    },
};

// 监听消息
chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
    console.log(sender.tab ? "recieve msg from a content script:" + sender.tab.url : "recieve msg from the extension");
    // 处理确认框的结果消息
    if('modal-confirm' in req && _confirmParam != null){
        // 回调
        if(req['modal-confirm'])
            _confirmParam.confirm();
        else
            _confirmParam.cancel();

        // 清理confirm弹窗参数
        _confirmParam = null;
    }

    sendResponse({}); // snub them.
});