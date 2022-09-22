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
            $.get("https://dict.youdao.com/suggest?num=5&ver=3.0&doctype=json&cache=false&le=en&q=" + txt,function(result,status){
                let entries = result['data']['entries'];
                if(typeof(entries) == "undefined" || entries.length == 0){
                    modalBg.toast('没查到该单词: ' + txt)
                    return
                }
                let msg = '词典释义:';
                for (let entry of entries){
                    msg += "\n" + entry['entry'] + ': ' + entry['explain'];
                }
                msg += "\n\n是否打词典网页？" 
                /*if (confirm(msg)) {
                    // 网页
                    window.open("https://youdao.com/result?word=" + txt + "&lang=en", "有道词典", "");
                }*/
                modalBg.confirm({
                      title: '词典释义',
                      message: msg,
                      confirm:function(){
                            window.open("https://youdao.com/result?word=" + txt + "&lang=en", "有道词典", "");
                      }
                })
            });
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
            let r = generateSaltSign(txt);
            let headers = {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                Referer: 'https://fanyi.youdao.com/',
                Host: 'fanyi.youdao.com',
                Origin: 'https://fanyi.youdao.com',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            };
            let data = {
                i: txt,
                from: "AUTO",
                to: "AUTO",
                smartresult: "dict",
                client: "fanyideskweb",
                salt: r.salt,
                sign: r.sign,
                lts: r.ts,
                bv: r.bv,
                doctype: "json",
                version: "2.1",
                keyfrom: "fanyi.web",
                action: "FY_BY_REALTlME"
            };
            // url是 /translate_o -- https://www.cnblogs.com/lpyy/p/14399676.htm
            //let url = "https://fanyi.youdao.com/translate_o?smartresult=dict&smartresult=rule"; // 奇怪，网站调试js是这个url，但响应错误{"errorCode":50}, 看上面文章是差不多，只不过多加了cookie
            // url 是 /translate -- https://zhuanlan.zhihu.com/p/368198711
            let url = "https://fanyi.youdao.com/translate?smartresult=dict&smartresult=rule";
            m = $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                url: url,
                headers: headers,
                data: data,
                dataType: "json",
                success: function(result) {
                    //alert(JSON.stringify(result));
                    let entries = result['translateResult'][0];
                    if(typeof(entries) == "undefined" || entries.length == 0){
                        modalBg.toast('翻译失败:')
                        return
                    }
                    let msg = '';
                    for (let entry of entries){
                        // src原文，tgt翻译
                        msg += entry['src'] + "\n" + entry['tgt'] + "\n\n";
                    }
                    modalBg.alert('逐段翻译', msg);
                },
                error: function(e) {
                    alert('异常: ' + JSON.stringify(e));
                }
            })
        });
    }
});

// 有道翻译-生成签名
function generateSaltSign(txt) {
    // let navigatorAppVersion = '5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36';
    // let ver = $.md5(navigatorAppVersion);
    let ver = '84afaa1f696d79a939ece6748a3b1fcd';
    let ts = "" + (new Date).getTime()
      , salt = ts + parseInt(10 * Math.random(), 10);
    return {
        ts: ts,
        bv: ver,
        salt: salt,
        sign: $.md5("fanyideskweb" + txt + salt + "Ygy_4c=r#e#4EX^NUGUc5")
    }
}

// 5 连接mq server
chrome.contextMenus.create({
    title: '连接消息服务器',
    id: '5',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        // 连接mq server
        let mqServerUrl = read_options(false)['mqServerUrl'];
        connectMqServer(mqServerUrl)
        // 监听mq：远程打开
        subWebMq('remote_open', function(mq){
            let url = mq
            window.open(url, "远程打开", "");
        });
    }
});


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