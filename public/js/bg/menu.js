// 2 网页剪报
chrome.contextMenus.create({
    title: '网页剪报',
    id: '2',//一级菜单的id
    contexts: ['page', 'selection'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        chrome.tabs.getSelected(null, function (tab) {
            let title = tab.title;
            let url = params['pageUrl'];
            let note = title + "\n" + url;
            let txt = params['selectionText'];
            if(typeof(txt) != "undefined")
                note = note  + "\n" + txt;
            // 复制到剪切板
            let code = note.replace(/"/g,'\"').replace(/\n/g,'\\n');
            code = `copyTxt("${code}")`
            chrome.tabs.executeScript(tab.id, {
                code: code
            });
            // 提交后端
            let post_url = read_options(false)['notePostUrl'];
            $.post(post_url, {note: note}, function(result){
                modalBg.toast(result)
            });
        });
    }
});

// 3 有道词典
// 从 https://youdao.com/ 扒下来的api
chrome.contextMenus.create({
    title: '有道词典',
    id: '3',//一级菜单的id
    contexts: ['selection'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        chrome.tabs.getSelected(null, function (tab) {
            let txt = params['selectionText'];
            if(typeof(txt) == "undefined"){
                return
            }
            // api
            youdaoDict(txt, function(result){
                modalBg.confirm({
                    title: '词典释义',
                    message: result,
                    confirm:function(){
                        window.open("https://youdao.com/result?word=" + txt + "&lang=en", "有道词典", "");
                    }
                })
            })
        });
    }
});

// 4 有道翻译
// 从 https://fanyi.youdao.com/ 扒下来的api
chrome.contextMenus.create({
    title: '有道翻译',
    id: '4',//一级菜单的id
    contexts: ['selection'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        chrome.tabs.getSelected(null, function (tab) {
            let txt = params['selectionText'];
            if(typeof(txt) == "undefined"){
                return
            }
            youdaoTranslate(txt, function(result){
                modalBg.alert('逐段翻译', result);
            })
        });
    }
});

// 5 连接mq server
chrome.contextMenus.create({
    title: '连接消息服务器',
    id: '5',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        initMq() // 初始化mq处理
    }
});

// 自动连接消息服务器
let autoConnectMqServer = read_options(false)['autoConnectMqServer'];
if(autoConnectMqServer){
    console.log('自动连接消息服务器')
    initMq()
}

// 初始化mq处理
function initMq(){
    // 连接mq server
    let mqServerUrl = read_options(false)['mqServerUrl'];
    connectMqServer(mqServerUrl)
    // 监听mq：远程打开
    subWebMq('remote_open', function(mq, own){
        if(own){
            console.log('忽略自己调用的远程打开')
            return
        }
        let url = mq
        window.open(url, "远程打开", "");
    });
}


// 6 远程打开相同网页：发mq
chrome.contextMenus.create({
    title: '远程打开',
    id: '6',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        let url = params['pageUrl'];
        publishWebMq('remote_open', url)
    }
});

// 7 备份当前标签页
chrome.contextMenus.create({
    title: '备份当前标签页',
    id: '7',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        backupCurrTab();
    }
});

// 8 备份所有标签页
chrome.contextMenus.create({
    title: '备份所有标签页',
    id: '8',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        backupAllTabs();
    }
});

// 9 恢复备份的标签页
chrome.contextMenus.create({
    title: '恢复备份的标签页',
    id: '9',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        recoverTabs();
    }
});

// 10 管理备份的标签页
chrome.contextMenus.create({
    title: '管理备份的标签页',
    id: '10',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        openOrSwitchTab(chrome.runtime.getURL('index.html#/app/about'))
    }
});

// 11 清空备份的标签页
chrome.contextMenus.create({
    title: '清空备份的标签页',
    id: '11',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        clearBackupTabs()
    }
});
