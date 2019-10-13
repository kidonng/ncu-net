import got from 'got'
import chalk from 'chalk'
import sleep from 'sleep-promise'
import { load } from 'cheerio'
import {
  config,
  log,
  retry,
  jsonp,
  md5,
  sha1,
  base64,
  xEncode,
  AP
} from '../utils'

const connect = async () => {
  if (config.has('ncuxg') || config.has('ncuwlan')) {
    const { ap, connected } = await retry(detectAP)

    if (config.has(ap))
      connected ? checkConnection(ap) : retry(() => connectAP(ap))
    else log(Error(`${AP[ap].name} account not set`))
  } else log(Error('Please set at least one account'))
}

const detectAP = async () => {
  const { url, body } = await got('http://www.baidu.com')

  let ap: keyof typeof AP
  let connected = false

  if (url.includes(AP['ncuxg'].origin)) ap = 'ncuxg'
  else if (body.includes(AP['ncuwlan'].origin)) ap = 'ncuwlan'
  else {
    connected = true

    if (config.has('ncuxg'))
      ap = (await getStatus('ncuxg')) ? 'ncuxg' : 'ncuwlan'
    else ap = (await getStatus('ncuwlan')) ? 'ncuwlan' : 'ncuxg'
  }

  return { ap, connected }
}

const connectAP = async (ap: keyof typeof AP) => {
  const { name, origin } = AP[ap]
  // Constants
  const enc_ver = 'srun_bx1'
  const n = 200
  const type = 1
  // Placeholder
  const callback = 'jsonp'

  log(`Connecting ${name}`, true)

  // `NCUXGAccount` type is used for destructing `isp`
  let { username, password, isp } = config.get(ap)
  if (isp) username += `@${isp}`

  // Get client info
  const { body: page } = await got(origin)
  const $ = load(page)
  const ip = $('[name="user_ip"]').val()
  const ac_id = $('[name="ac_id"]').val()

  // Get challenge (token)
  const { body: challengeData } = await got(`${origin}/cgi-bin/get_challenge`, {
    query: { username, ip, callback }
  })
  const { challenge } = jsonp(challengeData)

  // Process required credentials
  const infoData = JSON.stringify({
    username,
    password,
    ip,
    acid: ac_id,
    enc_ver
  })
  const info = `{SRBX1}${base64(xEncode(infoData, challenge))}`

  password = md5(password, challenge)
  const chksum = sha1(
    [, username, password, ac_id, ip, n, type, info].join(challenge)
  )
  password = `{MD5}${password}`

  // Login
  // `os`, `name` (system platform) and `double_stack` are presented in original code but unnecessary
  const { body: login } = await got(`${origin}/cgi-bin/srun_portal`, {
    query: {
      action: 'login',
      username,
      password,
      ac_id,
      ip,
      chksum,
      info,
      n,
      type,
      callback
    }
  })
  const { error, ploy_msg, error_msg } = jsonp(login) as {
    error: string
    ploy_msg: string
    error_msg: string
  }

  if (error === 'ok') return checkConnection(ap)
  else {
    await sleep(config.get('retry'))

    connectAP(ap)

    log(Error(ploy_msg || error_msg))
  }
}

const checkConnection = async (ap: keyof typeof AP) => {
  log(chalk.green(`Connected to ${AP[ap].name}`))

  await sleep(config.get('check'))

  if (await retry(() => getStatus(ap))) checkConnection(ap)
  else await connect()
}

const getStatus = async (ap: keyof typeof AP) => {
  const { origin } = AP[ap]
  const { username } = config.get(ap)

  const { body } = await got(`${origin}/cgi-bin/rad_user_info`)
  const [currentUser] = body.split(',')

  // Logged in
  return currentUser === username
}

export { connect }
