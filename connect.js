const Conf = require('conf')
const ping = require('ping')
const got = require('got')
const cheerio = require('cheerio')

// Use jshashes from the authentication page, because its Base64 encryption method is different from the original module
const Hashes = require('./lib/hashes.min')
const xEncode = require('./lib/xEncode')
const base64encode = require('./lib/base64')

const { ncuxg, ncuwlan, timing } = new Conf({ projectName: 'ncu-net' }).store
const log = msg => {
  const now = new Date()
  if (msg instanceof Error)
    console.log(
      `${now.toLocaleDateString()} ${new Date().toLocaleTimeString()} Error info:`
    )
  console.log(
    `${now.toLocaleDateString()} ${new Date().toLocaleTimeString()} ${msg}`
  )
}
// For JSONP callback
const callback = 'callbackFn'
const callbackFn = data => data

let isFirstConnect = true

const checkConnection = async () => {
  if ((await ping.promise.probe('wx4.sinaimg.cn')).alive) {
    if (isFirstConnect) {
      isFirstConnect = false

      log(
        `You are already connected. Checking connection every ${timing.checkInterval /
          1000}s.`
      )
    }

    setTimeout(checkConnection, timing.checkInterval)
  } else {
    if (isFirstConnect) {
      log('You are not connected. Detecting access point...')
      detectAP()
    } else {
      log(
        `You seem to be offline. Redetect access point in ${timing.retryTimeout /
          1000}s.`
      )
      setTimeout(detectAP, timing.retryTimeout)
    }
  }
}

const detectAP = async () => {
  isFirstConnect = false

  try {
    // Follow redirect
    const body = (await got(
      'http://wx4.sinaimg.cn/large/0060lm7Tly1fz2yx9quplj300100107g'
    )).body

    if (body.includes('222.204.3.221')) connectNCUWLAN()
    else if (body.includes('222.204.3.156')) connectNCUXG()
    else {
      isFirstConnect = true

      log('Access point unknown. Rechecking connection...')
      checkConnection()
    }
  } catch (e) {
    log(
      `Failed to detect access point, retry in ${timing.retryTimeout / 1000}s.`
    )
    log(e)
    setTimeout(detectAP, timing.retryTimeout)
  }
}

const connectNCUWLAN = async () => {
  log('Access point is NCUWLAN. Connecting...')

  const ac_id = (await got('http://222.204.3.221')).url.match(
    /\/index_([\d]+).html/
  )[1]
  const ajax = 1

  if (!(ncuwlan.username && ncuwlan.password))
    throw new Error('NCUWLAN account has not been set yet.')
  const username = ncuwlan.username
  const password = ncuwlan.password

  const connect = async () => {
    try {
      const res = (await got.post(
        'http://222.204.3.221/include/auth_action.php',
        {
          body: {
            action: 'login',
            username,
            password: `{B}${base64encode(password)}`,
            ac_id,
            ajax
          },
          form: true
        }
      )).body

      if (res.includes('login_ok')) {
        log('Successfully connected.')
        setTimeout(checkConnection, timing.checkInterval)
      } else {
        log(`Failed to connect. Retry in ${timing.retryTimeout / 1000}s.`)
        setTimeout(connect, timing.retryTimeout)
      }
    } catch (e) {
      log(`Failed to connect. Retry in ${timing.retryTimeout / 1000}s.`)
      log(e)
      setTimeout(connect, timing.retryTimeout)
    }
  }

  connect()
}

const connectNCUXG = async () => {
  log('Access point is NCU-5G/NCU-2.4G. Connecting...')

  const $ = cheerio.load((await got('http://222.204.3.154/')).body)
  const ip = $('[name="user_ip"]').val()
  const ac_id = $('[name="ac_id"]').val()
  const enc_ver = 'srun_bx1'
  const n = 200
  const type = 1

  if (!(ncuxg.username && ncuxg.isp && ncuxg.password))
    throw new Error('NCU-5G/NCU-2.4G account has not been set yet.')
  const username = `${ncuxg.username}@${ncuxg.isp}`
  const password = ncuxg.password

  const connect = async () => {
    try {
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

      try {
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

        if (res.res === 'ok') {
          log('Successfully connected.')
          setTimeout(checkConnection, timing.checkInterval)
        } else {
          log(`Failed to connect. Retry in ${timing.retryTimeout / 1000}s.`)
          setTimeout(connect, timing.retryTimeout)
        }
      } catch (e) {
        log(`Failed to connect. Retry in ${timing.retryTimeout / 1000}s.`)
        log(e)
        setTimeout(connect, timing.retryTimeout)
      }
    } catch (e) {
      log(`Failed to get token. Retry in ${timing.retryTimeout / 1000}s.`)
      log(e)
      setTimeout(connect, timing.retryTimeout)
    }
  }

  connect()
}

module.exports = checkConnection
