// 右键菜单
chrome.contextMenus.create({
    title: '知乎支持复制',
    id: '10',//一级菜单的id
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
