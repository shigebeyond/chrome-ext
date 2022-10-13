import querystring from querystring;

/**
 * http请求序列化器 
 * 
 */
class HttpSerializer {

    constructor(req) {
        this.req = req;
    }


    /**
    * 构建请求头
    *
    * @param array data
    * @return string
    */
    buildCurlHeader(data)
    {
        let str = "";
        for (let v of data) {
            str += `-H '${v.name}:${encodeURIComponent(v.value)}' `;
        }
        return str;
    }

    /**
    * 构建query string
    *
    * @param array data
    * @param string sep 分隔符
    * @return string
    */
    buildCurlQuery(data, sep = '&')
    {
        // return querystring.stringify(data);
        let str = "";
        for (let v of data) {
            str += `${v.name}=${encodeURIComponent(v.value)}${sep}`;
        }
        // 去掉最后的分隔符
        if(str.slice(-sep.length) == sep){
            return str.slice(0, -sep.length)
        }
        return str;
    }

    /**
    * 构建cookie请求头
    *
    * @param array data
    * @return string
    */
    buildCurlCookie(data)
    {
        if(data.length == 0)
            return ''

        let c = buildCurlQuery(data, '; ')
        return `-H 'cookie: ${c}'`
    }

    /**
    * 生成curl命令
    * @return string
    */
    toCurl()
    {
        let isPost = this.req.method.toLowerCase() == 'post';
        let flag = isPost ? '' : '-G';
        let headers = this.buildCurlHeader(this.req.headers);
        let cookie = this.buildCurlCookie(this.req.cookies)
        // let query = this.buildCurlQuery(this.req.queryString);
        let data = '';
        if(isPost){
            data = '-d ' + this.req.postData.text;
        }
        return `curl ${flag} ${headers} ${data} '${this.req.url}'`;
    }
}

export default HttpSerializer