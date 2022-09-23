// 读单项
function readStore(key){
  var val = localStorage[key];
  if (val)
    return JSON.parse(val);
  
  return val
}

// 写单项
function writeStore(key, value){
  var json = JSON.stringify(value);
  localStorage["options"] = json;
}

// 删单项
function delStore(key){
  localStorage.removeItem("options")
}


// 清空所有
function clearStores(){
  localStorage.clear();
}

