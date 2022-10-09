// 由于他在 content_scripts 中只针对知乎网站，但通用网站已加载了copy.js，因此不能重复require
/* global $ */
/* global modal */
/* global copyTxt */

// import $ from "jquery";
// import modal from "../lib/modal";
// import {copyTxt} from "./copy";

// 复制答案
export function copyAnswer(e){
    let ele = e.currentTarget;
    // 获得答案
    let txt = ele.innerText;
    txt = txt.replace(/\n\n/g,'\n');

    let ans = $(ele).closest('.AnswerItem');
    // 获得url
    // <meta itemprop="url" content="https://www.zhihu.com/question/29747607/answer/784851871">
    let url = ans.children("meta[itemprop='url']").attr('content');
    if(typeof(url) == "undefined")
        url = window.location.href;
    //alert(url)

    // 获得作者名
    let author = ans.find("meta[itemprop='name']").attr('content');
    if(typeof(author) == "undefined")
        author = $('.UserLink-link').text();
    // alert(author)

    let title = document.title.replace(' - 知乎', '');
    let i = title.indexOf(") ")
    if(i >= 0)
        title = title.substr(i + 1);
    title = title + ' -- ' + author + "的回答";
    txt = title + "\n" + url + "\n" + txt;

    copyTxt(txt)

    modal.toast('已复制:' + title);
}
// 知乎复制
function copyZhihu(){
    // $(".RichText").dblclick(copyAnswer);
    // 支持动态新元素
    // 回答是 span.RichText， 文章是 div.RichText
    $("body").on("dblclick", ".RichText", copyAnswer);
    modal.toast('注入复制脚本: 双击复制答案');
};
copyZhihu();