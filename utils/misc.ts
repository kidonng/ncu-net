import chalk from 'chalk'
import outdent from 'outdent'
import pRetry from 'p-retry'
import { config } from './config'

const log = (msg: string | Error, timestamp = false) => {
  if (typeof msg === 'string') {
    const now = new Date()
    const time = chalk.blue(
      `${now.toLocaleDateString()} ${now.toLocaleTimeString()} `
    )

    console.log(outdent.string(timestamp ? `${time}${msg}` : msg))
  } else console.log(chalk.red(String(msg)))
}

const retry = <T>(fn: (attemptCount: number) => PromiseLike<T> | T) =>
  pRetry(fn, {
    forever: true,
    minTimeout: config.get('retry'),
    onFailedAttempt: err => log(err)
  })

// jsonp('foo({ "bar": "baz" })') => { bar: 'baz' }
const jsonp = (cb: string) => {
  const start = cb.indexOf('(') + 1
  const end = cb.length - 1

  return JSON.parse(cb.substring(start, end))
}

export { log, retry, jsonp }
