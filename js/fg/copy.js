// 复制文本到内存
function copyTxt(txt){
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