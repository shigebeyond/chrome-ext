
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

/**
 * 备份当前标签页
 */
function backupCurrTab() {
    chrome.tabs.getSelected(null, function (tab) {
        appendStore("backupTabs", tab2entity(tab))
        modalBg.toast('备份成功', 1)
    })
}

/**
 * 备份所有标签页
 */
function backupAllTabs() {
    getAllTabPages(function (tabs) {
        let pages = tabs.map(tab2entity)
        appendStore("backupTabs", pages)
        modalBg.toast('备份成功', 1)
    })
}

/**
 * 恢复备份的标签页
 */
function recoverTabs() {
    // 获得备份的标签页
    var pages = readStore("backupTabs")
    /*pages = [{
        id: 1,
        name: 'test',
        url: 'https://open.chrome.360.cn/extension_dev/windows.html',
        date: '2022-09-28'
    }]*/
    // alert(pages)
    // 标签页为空
    if (typeof (pages) == "undefined" || pages.length == 0) {
        modalBg.toast('无备份标签页')
        return
    }
    let urls = pages.map((page) => {
        return page['url'];
    })
    // 新建视窗
    chrome.windows.create({
        url: urls
    }, function (win) {
        console.log('新建视窗: ' + JSON.stringify(win))
        setTimeout(function () {
            modalBg.confirm({
                title: '提示',
                message: '已恢复备份的标签页，是否删除备份数据',
                confirm: function () {
                    delStore("backupTabs")
                }
            })
        }, 2000)
    })
}

/**
 * 清空备份的标签页
 */
function clearBackupTabs() {
    clearStores("backupTabs")
    modalBg.toast('清空完毕')
}