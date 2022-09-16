// 右键菜单
// 1 知乎支持复制
chrome.contextMenus.create({
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
                file: 'js/jquery-1.10.2.min.js'
            });
            chrome.tabs.executeScript(tab.id, {
                //code: code
                file: 'js/zhihu-copy.js', // 相对于根目录
            });
        });
    }
});


// 2 网页剪切报
chrome.contextMenus.create({
    title: '网页剪切报',
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
            $.post("http://localhost/note.php",{note: note},function(result){
                alert(result);
            });
        });
    }
});
