/* global chrome */
import $ from "jquery";
import modalBg from '../lib/modal-bg';
import store from '../lib/store';
import tabx from '../lib/tabx';
import wmq from '../lib/web-mq';
import { genUuid, getFormatDateTime, isHttpUrl } from '../lib/util'
import { youdaoDict, youdaoTranslate } from '../lib/youdao';

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
            let code = note.replace(/"/g,'"').replace(/\n/g,'\\n');
            code = `copyTxt("${code}")`
            chrome.tabs.executeScript(tab.id, {
                code: code
            });
            // 提交后端
            let post_url = store.readOption('notePostUrl');
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
let autoConnectMqServer = store.readOption('autoConnectMqServer');
if(autoConnectMqServer){
    console.log('自动连接消息服务器')
    initMq()
}

// 初始化mq处理
function initMq(){
    // 连接mq server
    let mqServerUrl = store.readOption('mqServerUrl');
    if(mqServerUrl == ''){
        modalBg.toast('未配置选项: mqServerUrl', 1)
        return
    }
    wmq.connectMqServer(mqServerUrl)
    // 监听mq：远程打开
    wmq.subWebMq('remote_open', function(mq, own){
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
        wmq.publishWebMq('remote_open', url)
    }
});

// 7 备份当前标签页
chrome.contextMenus.create({
    title: '备份当前标签页',
    id: '7',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        backupCurrentTab()
    }
});
// 监听manifest.json中设置的快捷键
chrome.commands.onCommand.addListener(function (command) {
    if (command === "backup-current") {
        // bug: 不懂为啥，只调用一次，但备份数据插入了2次
        // fix: store.appendStore() 实现去重
        backupCurrentTab()
    }
});
function backupCurrentTab(){
    chrome.tabs.getSelected(null, function (tab) {
        if(!isHttpUrl(tab.url)){
            alert('忽略非http协议的标签页')
            return
        }
        console.log('备份标签页: ' + tab.url)
        store.appendStore("backupTabs", tabx.tab2entity(tab))
        //modalBg.toast('备份成功', 1)
        chrome.tabs.remove(tab.id)
    })
}

// 8 备份所有标签页
chrome.contextMenus.create({
    title: '备份所有标签页',
    id: '8',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        backupAllTabs()        
    }
});

function backupAllTabs(){
    tabx.getAllHttpTabs(function (tabs) {
        let entities = tabs.map(tabx.tab2entity)
        store.appendStore("backupTabs", entities)
        modalBg.confirm({
            title: '提示',
            message: '已备份成功, 是否关闭所有标签页?',
            confirm: function () {
                // 关闭所有窗口
                tabx.closeAllWins()
                // 打开标签页管理页面
                openBackupTabsPage()
            }
        })
    })
}

// 9 管理备份的标签页
chrome.contextMenus.create({
    title: '管理备份的标签页',
    id: '9',//一级菜单的id
    contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
    onclick: function (params) {
        openBackupTabsPage()
    }
});

// 打开标签页管理页面
function openBackupTabsPage(){
    tabx.openOrSwitchTab('index.html#/tabList')
}