/**
 * 远程脚本管理（QuanX 举例，Surge 同理）
 * 
 * 1.设置定时任务更新添加的远程脚本，第一次运行需要手动执行一下更新脚本（ Qanx 普通调试模式容易更新失败，使用最新 TF 红色按钮调试），例如设置每天凌晨更新脚本：
 * [task_local]
 * 0 0 * * * eval_script.js
 * 
 * 2.__conf 配置说明：
 * 参考下面 __conf 对象，key = 远程脚本的 URL，value = 匹配脚本对应的 URL
 * 
 * 3.修改配置文件的本地脚本为此脚本，例如之前京东 jd_price.js 改为 eval_script.js 即可：
 * [rewrite_local]
 * # ^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig) url script-response-body jd_price.js
 * ^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig) url script-response-body eval_script.js
 * [mitm]
 * hostname = api.m.jd.com
 */

const __conf = {
    // JD App 显示历史价格 by yichahucha
    "https://raw.githubusercontent.com/yichahucha/surge/master/jd_price.js": "^https?:\/\/api\.m\.jd.com",
    // Taobao App 显示历史价格 by yichahucha
    "https://raw.githubusercontent.com/yichahucha/surge/master/tb_price.js": ["^https?:\/\/trade-acs\.m\.taobao\.com", "^https?://amdc\.m\.taobao\.com"],
    // Netflix 获取 IMDb 分数 by yichahucha
    "https://raw.githubusercontent.com/yichahucha/surge/master/nf_rating.js": "^https?:\/\/ios\.prod\.ftl\.netflix\.com",
    // 微博应用内去广告 by yichahucha
    "https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js": "^https?:\/\/m?api\.weibo\.c(n|om)",
    // 微博启动页去广告 by yichahucha
    "https://raw.githubusercontent.com/yichahucha/surge/master/wb_launch.js": "^https?:\/\/(sdk|wb)app\.uve\.weibo\.com",
    // 微信公众号去广告 by Choler&NoByDa
    "https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/File/Wechat.js": "^https?:\/\/mp\.weixin\.qq\.com",
    // 哔哩哔哩 App 去广告 by onewayticket255&Primovist
    "https://raw.githubusercontent.com/primovist/ScriptsForSurge/master/Scripts/Bilibili.js": "^https?:\/\/ap(i|p)\.bilibili\.com",
    // 抖音去广告去水印 By Choler
    "https://raw.githubusercontent.com/Choler/Surge/master/Script/Aweme.js": "^https?:\/\/.*\.amemv\.com",
    "https://raw.githubusercontent.com/Choler/Surge/master/Script/Super.js": "^https?:\/\/[a-z]*\.snssdk\.com",
    // 動畫瘋去广告 by NoByDa
    "https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Bahamut.js": "^https?:\/\/api\.gamer\.com",
    // 用药助手专业版 By Primovist
    "https://raw.githubusercontent.com/primovist/ScriptsForSurge/master/Scripts/DingXiangDrugs.js": "^https?:\/\/(i|newdrugs)\.dxy\.cn",
    // WPS VIP By eHpo
    "https://raw.githubusercontent.com/eHpo1/Surge/master/Script/wps.js": "^https?:\/\/account\.wps\.cn",
    // CamScanner by langkhach270389
    "https://raw.githubusercontent.com/langkhach270389/Scripting/master/CamScaner.js": "^https?:\/\/(api|api-cs)\.intsig\.net",
    // PicsArt Pro by langkhach270389&NoByDa
    "https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/PicsArt.js": "^https?:\/\/api\.(picsart|meiease)\.c(n|om)",
    // Musixmatch Premium by langkhach270389
    "https://raw.githubusercontent.com/langkhach270389/Scripting/master/musixmatch.miao.js": "^https?:\/\/apic\.musixmatch\.com",
    // VUE Vlog Pro by NoByDa
    "https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/VUE.js": "^https?:\/\/api\.vuevideo\.net",
    // Documents Professional by langkhach270389
    "https://raw.githubusercontent.com/langkhach270389/Scripting/master/documents.js", "^https?:\/\/license\.pdfexpert\.com",
    // PDF Expert PRO by langkhach270389
    "https://raw.githubusercontent.com/langkhach270389/Scripting/master/Pdfexpert.vip.js": "^https?:\/\/license\.pdfexpert\.com"
}

const __tool = new __Tool()
const __isTask = __tool.isTask

if (__isTask) {
    const downloadScript = (url) => {
        return new Promise((resolve) => {
            __tool.get(url, (error, response, body) => {
                let filename = url.match(/.*\/(.*?)$/)[1]
                if (!error) {
                    if (response.statusCode == 200) {
                        __tool.write(body, url)
                        resolve(`🪓${filename} update success`)
                        console.log(`Update success: ${url}`)
                    } else {
                        resolve(`🪓${filename} update fail`)
                        console.log(`Update fail ${response.statusCode}: ${url}`)
                    }
                } else {
                    resolve(`🪓${filename} update fail`)
                    console.log(`Update fail ${error}: ${url}`)
                }
            })
        })
    }
    const promises = (() => {
        let all = []
        Object.keys(__conf).forEach((url) => {
            all.push(downloadScript(url))
        });
        return all
    })()
    console.log("Start updating...")
    Promise.all(promises).then(vals => {
        console.log("Stop updating.")
        console.log(vals.join("\n"))
        let lastDate = __tool.read("ScriptLastUpdateDate")
        lastDate = lastDate ? lastDate : new Date().Format("yyyy-MM-dd HH:mm:ss")
        __tool.notify("Update done.", `${lastDate} last update.`, `${vals.join("\n")}`)
        __tool.write(new Date().Format("yyyy-MM-dd HH:mm:ss"), "ScriptLastUpdateDate")
        $done()
    })
}

if (!__isTask) {
    const __url = $request.url
    const __script = (() => {
        let s = null
        for (let key in __conf) {
            let value = __conf[key]
            if (Array.isArray(value)) {
                value.some((item) => {
                    if (__url.match(item)) {
                        s = { url: key, content: __tool.read(key) }
                        return true
                    }
                })
            } else {
                if (__url.match(value)) {
                    s = { url: key, content: __tool.read(key) }
                }
            }
        }
        return s
    })()
    if (__script) {
        if (__script.content) {
            eval(__script.content)
            console.log(`Execute script: ${__script.url}`)
        } else {
            $done({})
            console.log(`Not found script: ${__script.url}`)
        }
    } else {
        $done({})
        console.log(`Not match URL: ${__url}`)
    }
}

if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]'
    }
}

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function __Tool() {
    _node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    _isSurge = typeof $httpClient != "undefined"
    _isQuanX = typeof $task != "undefined"
    _isTask = typeof $request == "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isTask = _isTask
    this.isResponse = typeof $response != "undefined"
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
        if (_node) console.log(`${key} write success`);
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
        if (_node) console.log(`${key} read success`);
    }
    this.get = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.get(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    this.post = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.post(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request.post(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    _status = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
}
