// 往 localStorage 写配置
function save_options(opt = null) {
  if(opt == null)
    opt = $("form").serializeObject();
  var json = JSON.stringify(opt);
  localStorage["options"] = json;
  alert('保存成功');
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
      $(`input[name=${k}]`).val(opt[k]);
    }
  }
  return opt;
}

// 初始化配置
function init_options(){
  opt = {
    'note_post_url': "http://localhost/note.php",
    'remote_open_post_url': "http://192.168.62.200/remote_open.php",
  }
  save_options(opt)
  return opt;
}

$(function(){
  read_options()
});