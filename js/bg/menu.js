// 右键菜单
// 1 知乎支持复制 -- 不用右键，直接在页面加载时就注入
/*chrome.contextMenus.create({
    title: '知乎支持复制',
    id: '1',//一级菜单的id
    onclick: function (params) {
        chrome.tabs.getSelected(null, function (tab) {
            // 测试，可以执行
            //var code = "document.body.style.backgroundColor='gray';alert(window.copy)";
            // 报错： $或window.copy is not defined
            //var code = "var c = window.copy;$('span.RichText').onclick = function(e){    var txt = e.currentTarget.innerText;    c(txt);    alert('已复制');};";
            // 要简化：直接使用file，而不是code
            //var code = "var arr = document.getElementsByClassName('RichText');for (let item of arr) {    item.onclick = function(e){        var txt = e.currentTarget.innerText;        txt = txt.replace(/\n\n/g,'\n');        var input = document.createElement('input');        document.body.appendChild(input);        input.setAttribute('value', txt);        input.select();        document.execCommand('copy');        document.body.removeChild(input);        alert('已复制');    };}";
            chrome.tabs.executeScript({
                //code: code
                file: 'js/lib/jquery-1.10.2.min.js'
            });
            chrome.tabs.executeScript(tab.id, {
                //code: code
                file: 'js/fg/zhihu-copy.js', // 相对于根目录
            });
        });
    }
});*/


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


// 7 备份打开的网址
chrome.contextMenus.create({
    title: '备份打开的网址',
    id: '7',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        getAllTabUrls(function(urls){
            writeStore("backupUrls", urls)
        })
    }
});


// 8 恢复备份的网址
chrome.contextMenus.create({
    title: '恢复备份的网址',
    id: '8',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        // 获得备份的网址
        var urls = readStore("backupUrls")
        //urls = ['https://open.chrome.360.cn/extension_dev/windows.html']
        // alert(urls)
        // 网址为空
        if(typeof(urls) == "undefined" || urls.length == 0){
            modalBg.toast('无备份网址')
            return
        }
        // 新建视窗
        chrome.windows.create({
            url: urls
        }, function(win) {
            console.log('新建视窗: ' + JSON.stringify(win))
            setTimeout(function(){
                modalBg.confirm({
                      title: '提示',
                      message: '已恢复备份网址，是否删除备份数据',
                      confirm:function(){
                            delStore("backupUrls")
                      }
                })
            }, 2000)
        })
    }
});