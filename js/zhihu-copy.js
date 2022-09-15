alert('注入复制脚本');
// 复制文本到内存
function copy_txt(txt){
    /* // input不支持多行，textarea支持多行
    let textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = txt;
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    */
    let textarea = $("#textarea");
    if(textarea.length == 0){
        textarea = $("<textarea id='textarea'></textarea>");
        $(document.body).append(textarea);
    }
    textarea.val(txt);
    textarea[0].select();
    document.execCommand('copy');
}
// 复制答案
function copy_answer(e){
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

    copy_txt(txt)

    alert('已复制:' + title);
}
// 知乎复制
function copy_zhihu(){
    // $(".RichText").click(copy_answer);
    // 支持动态新元素
    // 回答是 span.RichText， 文章是 div.RichText
    $("body").on("click", ".RichText", copy_answer);
};
copy_zhihu();

