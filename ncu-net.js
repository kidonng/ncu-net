const got = require('got')
const Hashes = require('./lib/hashes.min')

const log = (color, msg) =>
  console.log(
    require('chalk')[color](`${new Date().toTimeString().slice(0, 8)} ${msg}`)
  )
const callback = data => data

const config = {
  username: '',
  password: '',
  checkInterval: 3000,
  retryInterval: 10000
}

;(async () => {
  log('blue', 'Connecting...')

  const $ = require('cheerio').load((await got('http://222.204.3.154/')).body)
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
      log('green', 'Connect success.')
      timer = setInterval(check, config.checkInterval)
    } else {
      log(
        'red',
        `Connect failed! Retry in ${config.retryInterval / 1000} sec(s).`
      )
      timer = setTimeout(connect, config.retryInterval)
    }
  }

  const check = async () => {
    if (
      (await got('http://222.204.3.154/cgi-bin/rad_user_info')).body.indexOf(
        'not_online'
      ) === 0
    ) {
      log('red', 'Connect error! Reconnecting...')
      clearInterval(timer)
      connect()
    }
  }

  connect()
})()
