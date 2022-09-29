// 封装备份标签页的管理
/**
 * 获得所有标签页
 * @param callback 回调，接收1个参数
 */
function getAllTabs(callback){
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
                    //console.log(tab)
                    result.push(tab)
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
    getTabByUrl(url, function (tab){
        if(tab == null)
            window.open(url)
        else
            browser.tabs.update(tab.id, { active: true })
    })
}
