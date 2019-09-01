const Conf = require('conf')
const ping = require('ping')
const got = require('got')
const cheerio = require('cheerio')
const chalk = require('chalk')
const { md5hmac, sha1 } = require('../lib/hashes')
const xEncode = require('../lib/xEncode')
const { encode } = require('../lib/base64')

const { store } = new Conf({ projectName: 'ncu-net' })
const { timing } = store
const APs = {
  ncuxg: {
    name: 'NCU-5G/NCU-2.4G',
    server: '222.204.3.154'
  },
  ncuwlan: {
    name: 'NCUWLAN',
    server: '222.204.3.221'
  }
}
const log = msg => {
  const now = new Date()
  console.log(
    `${chalk.bold(now.toLocaleDateString())} ${chalk.bold(
      new Date().toLocaleTimeString()
    )} ${msg instanceof Error ? chalk.red(`Error: ${msg}`) : msg}`
  )
}

// JSONP callback
const callback = 'callbackFn'
const callbackFn = data => data

let isFirstConnect = true

const checkConnection = async () => {
  const { alive } = await ping.promise.probe(
    `wx${Math.ceil(Math.random() * 4)}.sinaimg.cn`
  )

  if (alive) {
    if (isFirstConnect) {
      isFirstConnect = false

      log(
        chalk.green(
          `You are online. Checking connection every ${timing.checkInterval /
            1000} s.`
        )
      )
    }

    setTimeout(checkConnection, timing.checkInterval)
  } else {
    if (isFirstConnect) {
      log(chalk.red('You are not connected. Detecting access point...'))
      detectAP()
    } else {
      log(
        chalk.red(
          `You seem to be offline. Redetect access point in ${timing.retryTimeout /
            1000} s.`
        )
      )
      setTimeout(detectAP, timing.retryTimeout)
    }
  }
}

const detectAP = async () => {
  isFirstConnect = false

  try {
    const random = Math.ceil(Math.random() * 4)
    const url = `http://wx${random}.sinaimg.cn/large/005BYqpggy1g4bzsci0gsj300100101v.jpg`
    // Follow redirect
    const { body } = await got(url)

    if (body.includes(APs.ncuwlan.server)) connectAP('ncuwlan')
    else if (body.includes(APs.ncuxg.server)) connectAP('ncuxg')
    else {
      log(
        chalk.green(
          `You are online. Checking connection every ${timing.checkInterval /
            1000} s.`
        )
      )
      checkConnection()
    }
  } catch (e) {
    log(
      chalk.red(
        `Failed to detect access point, retry in ${timing.retryTimeout /
          1000} s.`
      )
    )
    log(e)
    setTimeout(detectAP, timing.retryTimeout)
  }
}

const connectAP = async AP => {
  const { name, server } = APs[AP]
  const { username, password } = store[AP]

  log(chalk.blue(`Access point is ${name}. Connecting...`))

  const { body } = await got(`http://${server}/`)
  const $ = cheerio.load(body)

  const ip = $('[name="user_ip"]').val()
  const ac_id = $('[name="ac_id"]').val()
  const enc_ver = 'srun_bx1'
  const n = 200
  const type = 1

  if (!(username && password))
    throw new Error(`${name} account has not been set yet.`)

  const connect = async () => {
    try {
      const { body } = await got(`http://${server}/cgi-bin/get_challenge`, {
        query: { username, ip, callback }
      })
      const { challenge: token } = eval(body)
      const md5 = md5hmac(password, token)
      const rawInfo = JSON.stringify({
        username,
        password,
        ip,
        acid: ac_id,
        enc_ver
      })
      const info = `{SRBX1}${encode(xEncode(rawInfo, token))}`

      try {
        const { body } = await got(`http://${server}/cgi-bin/srun_portal`, {
          query: {
            action: 'login',
            username,
            password: `{MD5}${md5}`,
            ac_id,
            ip,
            n,
            type,
            info,
            chksum: sha1(
              [null, username, md5, ac_id, ip, n, type, info].join(token)
            ),
            callback
          }
        })
        const res = eval(body)

        if (res.res === 'ok') {
          log(chalk.green('Successfully connected.'))
          setTimeout(checkConnection, timing.checkInterval)
        } else {
          log(
            chalk.red(
              `Failed to connect. Retry in ${timing.retryTimeout / 1000} s.`
            )
          )
          setTimeout(connect, timing.retryTimeout)
        }
      } catch (e) {
        log(
          chalk.red(
            `Failed to connect. Retry in ${timing.retryTimeout / 1000} s.`
          )
        )
        log(e)
        setTimeout(connect, timing.retryTimeout)
      }
    } catch (e) {
      log(
        chalk.red(
          `Failed to get token. Retry in ${timing.retryTimeout / 1000} s.`
        )
      )
      log(e)
      setTimeout(connect, timing.retryTimeout)
    }
  }

  connect()
}

module.exports = checkConnection
