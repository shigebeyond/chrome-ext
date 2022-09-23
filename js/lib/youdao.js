/**
 * 有道词典
 * @param txt 单次
 * @param callback 回调函数，接收1个参数：词典查找结果
 */
function youdaoDict(txt, callback){
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
	    callback(msg)
	});
}

/**
 * 有道翻译
 * @param txt 单次
 * @param callback 回调函数，接收1个参数：翻译结果
 */
function youdaoTranslate(txt, callback){
	// 构建请求参数
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
    // 请求
    $.ajax({
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
            callback(msg)
        },
        error: function(e) {
            alert('翻译异常: ' + JSON.stringify(e));
        }
    })
}

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