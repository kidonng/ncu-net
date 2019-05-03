const config = {
  ncuxg: {
    studentNo: '',
    isp: 'cmcc',
    password: ''
  },
  ncuwlan: {
    studentNo: '',
    password: ''
  },

  // Available languages: en - English, zh - Simplified Chinese
  lang: 'zh',
  interval: {
    // Recommend not too low, or you'll encounter "Status Internal Server Error" and have to use dirty alternative check
    check: 5000,

    // Recommend >= 10s (NCUWLAN needs a 10s break between two logins)
    retry: 10000
  }
}

const msg =
  config.lang === 'zh'
    ? {
        starting: 'NCU Net 正在运行',
        ncuxg: '当前网络为 NCU-2.4G/NCU-5G',
        ncuwlan: '当前网络为 NCUWLAN',
        connecting: '正在连接',
        connectSuccess: '连接成功',
        connectFailed: `连接失败！${config.interval.retry / 1000} 秒后重试`,
        connectError: '连接异常！正在重新连接',
        statusError: '在线状态服务器出错！使用备用检查方式'
      }
    : {
        starting: 'NCU Net is running',
        ncuxg: 'Current network is NCU-2.4G/NCU-5G',
        ncuwlan: 'Current network is NCUWLAN',
        connecting: 'Connecting',
        connectSuccess: 'Connect success',
        connectFailed: `Connect failed! Retry in ${config.interval.retry /
          1000} sec(s)`,
        connectError: 'Connect error! Reconnecting',
        statusError: 'Status server error! Use alternative check method'
      }

const chalk = require('chalk')
const cheerio = require('cheerio')
const got = require('got')

// Use jshashes from the authentication page, because its Base64 encryption is different from the original module
const Hashes = require('./lib/hashes.min')
const xEncode = require('./lib/xEncode')

// For eval([JSONP callback]) use
const callback = data => data
const detectNet = async () => {
  const url = (await got('http://www.baidu.com/')).url
  if (url.includes('http://222.204.3.154/')) currentNet = 'NCUxG'
  else if (url.includes('http://222.204.3.221')) currentNet = 'NCUWLAN'
}
const log = (color, msg) => {
  const now = new Date()
  console.log(
    chalk[color](
      `${now.toLocaleDateString()} ${new Date().toLocaleTimeString()} ${msg}`
    )
  )
}

log('blue', msg.starting)

let currentNet = null
let timer = null

detectNet()

// TODO: Finish connected case (currentNet === null)
if (currentNet === 'NCUxG' || currentNet === null) {
  log('green', msg.ncuxg)
  ;(async () => {
    log('blue', msg.connecting)

    const username = `${config.ncuxg.studentNo}@${config.ncuxg.isp}`
    const password = config.ncuxg.password

    const $ = cheerio.load((await got('http://222.204.3.154/')).body)
    const ip = $('[name="user_ip"]').val()
    const ac_id = $('[name="ac_id"]').val()

    const enc_ver = 'srun_bx1'
    const n = 200
    const type = 1

    const connect = async () => {
      const token = eval(
        (await got('http://222.204.3.154/cgi-bin/get_challenge', {
          query: { username, ip, callback: 'callback' }
        })).body
      ).challenge
      const md5 = new Hashes.MD5().hex_hmac(token, password)
      const info = `{SRBX1}${new Hashes.Base64().encode(
        xEncode(
          JSON.stringify({
            username,
            password,
            ip,
            acid: ac_id,
            enc_ver
          }),
          token
        )
      )}`

      const res = eval(
        (await got('http://222.204.3.154/cgi-bin/srun_portal', {
          query: {
            action: 'login',
            username,
            password: `{MD5}${md5}`,
            ac_id,
            ip,
            n,
            type,
            info,
            chksum: new Hashes.SHA1().hex(
              [null, username, md5, ac_id, ip, n, type, info].join(token)
            ),
            callback: 'callback'
          }
        })).body
      )

      // E2620: Already connected
      if (res.res === 'ok' || res.ecode === 'E2620') {
        log('green', msg.connectSuccess)
        timer = setInterval(check, config.interval.check)
      } else {
        log('red', msg.connectFailed)
        timer = setTimeout(connect, config.interval.retry)
      }
    }

    const check = async () => {
      try {
        if (
          (await got(
            'http://222.204.3.154/cgi-bin/rad_user_info'
          )).body.includes('not_online_error')
        ) {
          log('red', msg.connectError)
          clearInterval(timer)
          connect()
        }
      } catch {
        log('red', msg.statusError)
        clearInterval(timer)
        timer = setTimeout(alternativeCheck, config.interval.check)
      }
    }

    const alternativeCheck = async () => {
      try {
        await got(
          `https://i.loli.net/2019/04/28/5cc55262e0b92.png?${Math.random()}`
        )
      } catch {
        log('red', msg.connectError)
        clearInterval(timer)
        connect()
      }
    }

    connect()
  })()
} else {
  log('green', msg.ncuwlan)
  log('red', "Sorry, currently NCUWLAN isn't supported.")
}
