const config = {
  username: '',
  password: '',
  lang: 'en', // Available language: en (English) / zh (Simplified Chinese)
  checkInterval: 5000,
  retryInterval: 10000 // Recommend >= 10s
}

const msg =
  config.lang === 'zh'
    ? {
        connecting: '正在连接……',
        connectSuccess: '连接成功。',
        connectFailed: `连接失败！${config.retryInterval /
          1000} 秒后重试，点击注销按钮取消。`,
        connectError: '连接异常！正在重新连接……'
      }
    : {
        connecting: 'Connecting...',
        connectSuccess: 'Connect success.',
        connectFailed: `Connect failed! Retry in ${config.retryInterval /
          1000} sec(s), click logout button to cancel.`,
        connectError: 'Connect error! Reconnecting...'
      }

const chalk = require('chalk')
const cheerio = require('cheerio')
const got = require('got')
const Hashes = require('./lib/hashes.min')

const log = (color, msg) => {
  const now = new Date()
  console.log(
    chalk[color](
      `${now.toLocaleDateString()} ${new Date().toLocaleTimeString()} ${msg}`
    )
  )
}
const callback = data => data

;(async () => {
  log('blue', msg.connecting)

  const $ = cheerio.load((await got('http://222.204.3.154/')).body)
  const ip = $('[name="user_ip"]').val()
  const ac_id = $('[name="ac_id"]').val()
  const n = 200
  const type = 1
  let timer = null

  const connect = async () => {
    const token = eval(
      (await got('http://222.204.3.154/cgi-bin/get_challenge', {
        query: {
          username: config.username,
          ip,
          callback: 'callback'
        }
      })).body
    ).challenge
    const md5 = new Hashes.MD5().hex_hmac(token, config.password)
    const info = `{SRBX1}${new Hashes.Base64().encode(
      require('./lib/xEncode')(
        JSON.stringify({
          username: config.username,
          password: config.password,
          ip,
          acid: ac_id,
          enc_ver: 'srun_bx1'
        }),
        token
      )
    )}`

    const res = eval(
      (await got('http://222.204.3.154/cgi-bin/srun_portal', {
        query: {
          action: 'login',
          username: config.username,
          password: `{MD5}${md5}`,
          ip,
          ac_id,
          info,
          chksum: new Hashes.SHA1().hex(
            [null, config.username, md5, ac_id, ip, n, type, info].join(token)
          ),
          n,
          type,
          callback: 'callback'
        }
      })).body
    )

    // E2620: Already connected
    if (res.res === 'ok' || res.ecode === 'E2620') {
      log('green', msg.connectSuccess)
      timer = setInterval(check, config.checkInterval)
    } else {
      log('red', msg.connectFailed)
      timer = setTimeout(connect, config.retryInterval)
    }
  }

  const check = async () => {
    try {
      if (
        (await got('http://222.204.3.154/cgi-bin/rad_user_info')).body.includes(
          'not_online_error'
        )
      ) {
        log('red', msg.connectError)
        clearInterval(timer)
        connect()
      }
    } catch {
      clearInterval(timer)
      timer = setTimeout(alternativeCheck, config.checkInterval)
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
