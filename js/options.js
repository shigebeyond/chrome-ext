// 序列化表单
$.fn.serializeObject = function()
{
    var o = {};
    var arr = this.serializeArray();
    $.each(arr, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    // 处理checkbox
    let cb = this.find("input[type=checkbox]")
    $.each(cb, function() {
        o[this.name] = this.checked
    });
    //alert(JSON.stringify(o))
    return o;
};
// 往 localStorage 写配置
function save_options(opt = null, init = false) {
  // 获得配置
  if(opt == null){
    opt = $("form").serializeObject();

  }
  // 保存
  var json = JSON.stringify(opt);
  console.log('选项: ' + json)
  localStorage["options"] = json;

  if(!init){
    // 发消息：通知 web-mq.js 以便重新连接mq server
    publishLocalMq('mqServerUrlChange', opt['mqServerUrl'])

    alert('保存成功');
  }
}

// 从 localStorage 读配置
function read_options(fill_form = true) {
  var opt = localStorage["options"];
  if (!opt) {
    opt = init_options();
  }else{
    opt = JSON.parse(opt);
  }
  
  if(fill_form){ // 填表单
    for (let k in opt){
      let selector = `input[name=${k}]`
      let val = opt[k]
      if(typeof(val) == "boolean") // 布尔
        $(selector).prop('checked', val)
      else
        $(selector).val(val);
    }
  }
  return opt;
}

// 初始化配置
function init_options(){
  opt = {
    'notePostUrl': "http://localhost/note.php",
    'mqServerUrl': "http://127.0.0.1:16379",
    'autoConnectMqServer': true
  }
  save_options(opt, true)
  return opt;
}

$(function(){
  read_options();
  $('#save').click(function(){
    save_options()
  });
});