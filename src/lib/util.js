const tableIds = {}

// 生成递增id
export function genIncrId(table = '') {
    if(!table in tableIds){
        tableIds[table] = 1
    }
    return tableIds[table]++
}

// 生成uuid
export function genUuid() {
    let id = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// 格式化日期
export function getFormatDateTime(){
    var date = new Date();
    var year= date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return [year, '-', month , '-', day, ' ', hour , ':', minute, ':', second ].join('');
}

// http url的正则
export const httpDomainReg = /https?:\/\/([^/]+)/i;

/**
 * 是否http协议的url
 * @param url
 * @returns {boolean}
 */
export function isHttpUrl(url){
    return url.match(httpDomainReg) != null
}

/**
 * 解析域名
 * @param href
 * @returns string
 */
/*export function parseDomain(href, withProtocol = false){
    let domain = href.match(httpDomainReg);
    if(domain){
        if(withProtocol) // 带协议
            return domain[0]

        return domain[1]
    }
    return null
}*/
export function parseDomain(href = null, withProtocol = false){
   let url = parseUrl(href) 
   if(withProtocol) // 带协议
        return `${url.protocol}://${url.hostname}`

    return url.hostname
}

/**
 * 解析url
 * @param href
 * @returns string
 */
export function parseUrl(href = null) {
    if(href == null)
        href = window.location.href

    let url = new URL(href)
    return {
        protocol: url.protocol.replace(':', ''),
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        params: Object.fromEntries(url.searchParams),
        hash: url.hash
    }
}
