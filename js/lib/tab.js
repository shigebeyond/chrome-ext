/**
 * 获得所有tab的url
 * @param callback 回调，接收1个参数
 */
function getAllTabUrls(callback){
	// 获得所有视窗
    let urls = []
    chrome.windows.getAll(null, function(wins){ // 异步
        for (let i in wins){
            let win = wins[i]
            let isLastWin = (i == wins.length-1)
            // 获得所有标签
            chrome.tabs.getAllInWindow(win.id, function(tabs){ // 异步
                for (let i in tabs){
                    let tab = tabs[i]
                    let isLastTab = (i == tabs.length-1)
                    //console.log(tab)
                    // 收集url
                    //urls[tab.url] = tab.title
                    urls.push(tab.url)
                    if(isLastWin && isLastTab){
                        // 收集完毕
                        //alert(urls)
                        callback(urls)
                    }
                }
            })
        }

    })
}