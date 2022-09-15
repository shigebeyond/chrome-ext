alert('准备好复制');
// 复制文本到内存
function copy_txt(txt){
    let input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', txt);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
}
// 复制答案
function copy_answer(e){
    let ele = e.currentTarget;
    // 获得答案
    let txt = ele.innerText;
    txt = txt.replace(/\n\n/g,'\n');

    // 获得url
    // <meta itemprop="url" content="https://www.zhihu.com/question/29747607/answer/784851871">
    let url = $(ele).find("meta[itemprop='url']");
    alert(url)

    // 获得作者
    let author = '';

    copy_txt(txt)

    alert('已复制');
}
// 知乎复制
function copy_zhihu(){
    let arr = document.getElementsByClassName('RichText');
    for (let item of arr) {
        item.onclick = copy_answer;
    }
};
copy_zhihu();