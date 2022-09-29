/* global chrome */
/**
 * 关闭所有window
 */
function closeAllWins(callback = null){
    chrome.windows.getAll(null, function(wins){ // 异步
        for (let win of wins){
            chrome.windows.remove(win.id)
        }
        if(callback != null)
            callback()
    })
}

/**
 * 获得所有标签页
 * @param callback 回调，接收1个参数
 * @param filter 过滤，接收1个参数
 */
function getAllTabs(callback, filter = null){
	// 获得所有视窗
    let result = []
    chrome.windows.getAll(null, function(wins){ // 异步
        for (let i in wins){
            let win = wins[i]
            let isLastWin = (i == wins.length-1)
            // 获得所有标签
            chrome.tabs.getAllInWindow(win.id, function(tabs){ // 异步
                for (let i in tabs){
                    let tab = tabs[i]
                    let isLastTab = (i == tabs.length-1)
                    // 收集tab
                    if(filter == null || filter(tab)) { // 过滤
                        //console.log(tab)
                        result.push(tab) // 收集
                    }
                    if(isLastWin && isLastTab){
                        // 收集完毕
                        //alert(result)
                        callback(result)
                    }
                }
            })
        }
    })
}

/**
 * 获得所有标签页
 * @param callback 回调，接收1个参数
 */
function getAllHttpTabs(callback){
   getAllTabs(callback, isHttpUrl)
}

/**
 * 是否http协议的url
 * @param url
 * @returns {boolean}
 */
function isHttpUrl(url){
    let reg = /https?:\/\/.+/i;
    return url.match(reg) != null
}

/**
 * 根据url过滤tab
 * @param url
 * @param callback 回调，接收1个参数 tab
 */
function getTabByUrl(url, callback){
    // 获得所有标签
    chrome.tabs.getAllInWindow(null, function(tabs){ // 异步
        for (let tab of tabs){
            if (tab.url.startsWith(url)) {
                callback(tab)
                return
            }
        }
        callback(null)
    })
}

/**
 * 打开或切换url对应的tab
 * @param url
 */
function openOrSwitchTab(url){
    // 检查是否有协议
    let reg = /\w+:\/\/.+/i;
    if(url.match(reg) == null) // 无协议则为插件本地页面,补全chrome协议
        url = chrome.runtime.getURL(url)
    getTabByUrl(url, function (tab){
        if(tab == null)
            window.open(url)
        else
            chrome.tabs.update(tab.id, { active: true })
    })
}

// tab对象转实体
function tab2entity(tab) {
    let page = {
        id: createId(),
        name: tab.title,
        url: tab.url,
        date: getFormatDateTime()
    }
    return page;
}

// 创建id
function createId() {
    let id = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// 格式化日期
function getFormatDateTime(){
    var date = new Date();
    var year= date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return [year, '-', month , '-', day, ' ', hour , ':', minute, ':', second ].join('');
}

const tabx = {
    closeAllWins,
    getAllTabs,
    getAllHttpTabs,
    isHttpUrl,
    getTabByUrl,
    openOrSwitchTab,
    tab2entity
};
export default tabx;