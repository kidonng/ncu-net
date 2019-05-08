const config = {
  NCUXG: {
    studentNo: '',

    // ISPs: cmcc - 移动, unicom - 联通, ndcard - 电信, ncu - 校园网
    ISP: '',
    password: ''
  },

  // Available languages: en - English, zh - Simplified Chinese
  lang: 'zh',

  // Recommend not too low, or you'll encounter "Status Internal Server Error" and have to use dirty alternative check
  checkInterval: 5000,

  // Recommend >= 10s (NCUWLAN needs a 10s break between two logins)
  retryTimeout: 10000
}

const msg =
  config.lang === 'zh'
    ? {
        NCUXG: '当前网络为 NCU-2.4G/NCU-5G',
        NCUWLAN: '当前网络为 NCUWLAN',
        connecting: '正在连接',
        connectSuccess: '连接成功',
        connectFailed: `连接失败！${config.retryTimeout / 1000} 秒后重试`,
        connectError: '连接异常！正在重新连接',
        statusError: '连接状态服务器失败！使用备用检测方式'
      }
    : {
        NCUXG: 'Current network is NCU-2.4G/NCU-5G',
        NCUWLAN: 'Current network is NCUWLAN',
        connecting: 'Connecting',
        connectSuccess: 'Connect success',
        connectFailed: `Connect failed! Retry in ${config.retryTimeout /
          1000} sec(s)`,
        connectError: 'Connect error! Reconnecting',
        statusError: 'Status server error! Use alternative check method'
      }

const chalk = require('chalk')
const cheerio = require('cheerio')
const got = require('got')

// Use jshashes from the authentication page, because its Base64 encryption method is different from the original module
const Hashes = require('./lib/hashes.min')
const xEncode = require('./lib/xEncode')

const img = 'http://wx4.sinaimg.cn/large/0060lm7Tly1fz2yx9quplj300100107g'
let timer = null

// For JSONP callback
const callback = 'callbackFn'
const callbackFn = data => data

const net = async () => {
  const res = await got(img)

  if (res.url.includes('222.204.3.154')) return 'NCUXG'
  else if (res.body.startsWith('<html>')) return 'NCUWLAN'
  else return 'Connected'
}

const log = (color, msg) => {
  const now = new Date()
  console.log(
    chalk[color](
      `${now.toLocaleDateString()} ${new Date().toLocaleTimeString()} ${msg}`
    )
  )
}

;(async () => {
  if ((await net()) === 'NCUXG') {
    log('white', msg.NCUXG)

    const $ = cheerio.load((await got('http://222.204.3.154/')).body)
    const ip = $('[name="user_ip"]').val()
    const ac_id = $('[name="ac_id"]').val()
    const enc_ver = 'srun_bx1'
    const n = 200
    const type = 1

    const username = `${config.NCUXG.studentNo}@${config.NCUXG.ISP}`
    const password = config.NCUXG.password

    const connect = async () => {
      log('blue', msg.connecting)

      const token = eval(
        (await got('http://222.204.3.154/cgi-bin/get_challenge', {
          query: { username, ip, callback }
        })).body
      ).challenge
      const md5 = new Hashes.MD5().hex_hmac(token, password)
      const info = `{SRBX1}${new Hashes.Base64().encode(
        xEncode(
          JSON.stringify({ username, password, ip, acid: ac_id, enc_ver }),
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
            callback
          }
        })).body
      )

      // E2620: Already connected
      if (res.res === 'ok' || res.ecode === 'E2620') {
        log('green', msg.connectSuccess)

        timer = setInterval(check, config.checkInterval)
      } else {
        log('red', msg.connectFailed)

        timer = setTimeout(connect, config.retryTimeout)
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
        timer = setInterval(alternativeCheck, config.checkInterval)
      }
    }

    const alternativeCheck = async () => {
      try {
        await got(`${img}?${Math.random()}`)
      } catch {
        log('red', msg.connectError)

        clearInterval(timer)
        connect()
      }
    }

    connect()
  } else if ((await net()) === 'NCUWLAN') log('white', msg.NCUWLAN)
  else log('white', 'Connected')
})()
