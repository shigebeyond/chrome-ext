// import querystring from 'querystring';
import _ from 'lodash';

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
            // 值不需要 encodeURIComponent()
            str += `-H '${v.name}:${v.value}' `;
        }
        return str;
    }

    /**
    * 构建query string
    *
    * @param array data
    * @param string kvcon key与value之间的连接符
    * @param string sep 多项之间的分隔符
    * @return string
    */
    buildCurlQuery(data, kvcon = '=', sep = '&')
    {
        // return querystring.stringify(data);
        let str = "";
        for (let v of data) {
            // 值不需要 encodeURIComponent()
            str += `${v.name}${kvcon}${v.value}${sep}`;
        }
        // 去掉最后的分隔符
        /*if(str.slice(-sep.length) == sep){
            return str.slice(0, -sep.length)
        }
        return str*/
        return _.trimEnd(str, sep);
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

        let c = this.buildCurlQuery(data, '=', '; ')
        return `-H 'Cookie: ${c}'`
    }

    /**
     * 是否压缩
     */
    isGzip(){
        // 匹配请求头 Accept-Encoding:gzip, deflate
        let h = _.find(this.req.headers, h => h.name == 'Accept-Encoding');
        return h && h.value.indexOf('gzip') > -1
    }

    /**
    * 转为 curl命令
    * @return string
    */
    toCurl()
    {
        let isPost = this.req.method.toLowerCase() == 'post';
        let headers = this.buildCurlHeader(this.req.headers);
        let cookie = this.buildCurlCookie(this.req.cookies)
        // let query = this.buildCurlQuery(this.req.queryString);
        let data = '';
        if(isPost){
            data = `-d '${this.req.postData.text}'`;
        }
        let gzip = this.isGzip() ? '--compressed' : ''
        let cmd = `curl '${this.req.url}' ${headers} ${cookie} ${data} ${gzip}`;
        cmd = cmd.replace(/ (-{1,2}\w+)/g, " \\\n  \$1") // $n 是子表达式，只能从$1开始, $0是无效的 
        return cmd;
    }

    /**
     * 构建yaml的属性字符串
     * @param data
     * @param nIndent 缩进的次数
     * @return string
     */
    buildYamlProps(data, nIndent){
        let indent = "\t".repeat(nIndent)
        let s = this.buildCurlQuery(data, ': ', "\n" + indent);    
        if(s == '')
            return null
        return s
    }

    /**
     * 转为 HttpBoot 的yaml脚本
     */
    toHttpBootYaml()
    {
        let method = this.req.method.toLowerCase();
        let isPost = method == 'post';
        let url = this.req.url;
        let data = null;
        let headers = this.buildYamlProps(this.req.headers, 2);
        if(isPost){
            data = this.buildYamlProps(this.req.postData.params, 2);
        }else{
            url = url.split('?')[0] // 干掉query string
            data = this.buildYamlProps(this.req.queryString, 2);
        }
        let yaml = `- ${method}:
    url: ${url}
    headers: 
        ${headers}
    data: 
        ${data}
    validate_by_jsonpath:
        '$.code':
            '=': 200`;
        yaml = yaml.replace(/\n\s+headers:\s+null/g, '').replace(/\n\s+data:\s+null/g, '')
        return yaml
    }

    /**
     * 转为 HttpRunner 的yaml脚本
     */
    toHttpRunnerYaml()
    {
        let method = this.req.method.toUpperCase();
        let isPost = method == 'POST';
        let url = this.req.url;
        let name = '???'
        let params = null;
        let data = null;
        let headers = this.buildYamlProps(this.req.headers, 3);
        if(isPost){
            data = this.buildYamlProps(this.req.postData.params, 3);
        }else{
            url = url.split('?')[0] // 干掉query string
            params = this.buildYamlProps(this.req.queryString, 3);
        }
        let yaml = `- test:
    name: ${name}
    request:
        url: ${url}
        method: ${method}
        headers: 
            ${headers}
        params: 
            ${params}
        data: 
            ${data}
    validate:
        - eq: ['status_code',200]`;
        yaml = yaml.replace(/\n\s+headers:\s+null/g, '').replace(/\n\s+params:\s+null/g, '').replace(/\n\s+data:\s+null/g, '')
        return yaml
    }
}

export default HttpSerializer