import $ from "jquery";

// 复制文本到内存
export function copyTxt(txt){
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
        // 如果样式设为 display:none，则复制不了
        textarea = $("<textarea id='textarea' style='height:0px;'></textarea>");
        $(document.body).append(textarea);
    }
    textarea.val(txt);
    textarea[0].select();
    document.execCommand('copy');
}