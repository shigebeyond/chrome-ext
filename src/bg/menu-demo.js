// 测试右键菜单，有两级
chrome.contextMenus.create({
    title: "测试右键菜单", //菜单的名称
    id: '10',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
});

chrome.contextMenus.create({
    title: '百度', //菜单的名称
    id: '1101',//二级菜单的id
    parentId: '10',//表示父菜单是“右键快捷菜单”
    contexts: ['page'],
});


chrome.contextMenus.create({
    title: 'CSDN', //菜单的名称
    id: '1102',
    parentId: '10',//表示父菜单是“右键快捷菜单”
    contexts: ['page'],
});


chrome.contextMenus.create({
    title: '百度新闻',
    parentId: '1101',//1101就是上面定义的二级菜单“百度”的id
    onclick: function (params) {
        debugger;
        alert(JSON.stringify(params));
        chrome.tabs.getSelected(null, function (tab) {
            window.open("http://news.baidu.com/#index/cxPurchaseinfo/cxGoodsPurchases", "百度新闻", "");
        });
    }
});



function getUrl(str) {
    var according = "/#/";
    var url = str.split(according)[0];//以#号做分隔，获取分隔后的前半段url内容，即得到域名
    return url;
};


chrome.contextMenus.create({
    title: '个人资料',
    parentId: '1102',
    onclick: function (params) {
        debugger;
        alert(JSON.stringify(params));
        chrome.tabs.getSelected(null, function (tab) {
            var tabUrl = tab.url;//获取当前页面的url
            //通过getUrl方法把域名提取出来，适用于在一个管理系统下做很多个右键菜单，跳转该管理系统下不同子页面的需求
            var urls = getUrl(tabUrl);
            //域名+子页面的url
            window.open(urls + "/#/user-center/profile", "个人资料", "");
        });
    }
});

chrome.contextMenus.create({
    title: '浏览历史',
    parentId: '1102',
    onclick: function (params) {
        debugger;
        alert(JSON.stringify(params));
        chrome.tabs.getSelected(null, function (tab) {
            var tabUrl = tab.url;//获取当前页面的url
            //通过getUrl方法把域名提取出来，适用于在一个管理系统下做很多个右键菜单，跳转该管理系统下不同子页面的需求
            var urls = getUrl(tabUrl);
            //域名+子页面的url
            window.open(urls + "/#/user-center/history", "浏览历史", "");
        });
    }
});
