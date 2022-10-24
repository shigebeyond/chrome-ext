import _ from 'lodash';

// 读单项
function readStore(key){
  let val = localStorage[key];
  if (val)
    return JSON.parse(val);
  
  return val
}

// 写单项
function writeStore(key, value){
  let json = JSON.stringify(value);
  localStorage[key] = json;
}

// 追加
function appendStore(key, value){
  let arr = readStore(key) || []
  if(Array.isArray(value)){ // 数组合并
    arr = arr.concat(value)
  }else{
    // bug: 快捷键 backup-current不懂为啥，只调用一次，但备份数据插入了2次
    // fix: 检查去重
    let i = _.findIndex(arr, (o) => o.url == value.url );
    if(i != -1)
      return
    arr.push(value)
  }
  writeStore(key, arr)
}

// 删单项
function delStore(key){
  localStorage.removeItem(key)
}

// 清空所有
function clearStores(){
  localStorage.clear();
}

// 读单项, 如果不存在则写
function readOrWriteStore(key, defaultValue = null){
  let value = readStore(key)
  if(typeof(value) == "undefined"){
    writeStore(key, defaultValue)
    return defaultValue
  }

  return value
}

// 从 localStorage 读配置
function readOption(key) {
  let opts = readOrWriteStore("options", {
    notePostUrl: '',
    mqServerUrl: '',
    autoConnectMqServer: false
  })
  let opt = opts[key]
  if(opt.mqServerUrl == '')
    opt.autoConnectMqServer = false
  return opt
}

export default {
  readStore,
  writeStore,
  appendStore,
  delStore,
  clearStores,
  readOption
}
