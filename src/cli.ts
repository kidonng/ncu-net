import arg from 'arg'
import chalk from 'chalk'
import outdent from 'outdent'
import { connect } from './connect'
import { config, version, log, AP, ISP, Account, NCUXGAccount } from '../utils'

const setAccount = (account: string) => {
  const [ap, username, password, isp] = account.split(' ')

  if (
    ((ap === 'ncuxg' && isp in ISP) || ap === 'ncuwlan') &&
    username &&
    password
  ) {
    // `NCUXGAccount` type is used for setting config
    config.set(ap, { username, password, isp } as NCUXGAccount)

    return chalk.green(`Set ${AP[ap].name} account`)
  } else return new Error('Please provide a valid account')
}

const setCheck = (check: number) => {
  config.set({ check })
  return chalk.green(`Check network connection every ${check / 1000}s`)
}

const setRetry = (retry: number) => {
  config.set({ retry })
  return chalk.green(`Retry after connection failure in ${retry / 1000}s`)
}

const showConfig = () => {
  let text = `${chalk.blue('Config file path:')} ${config.path}`

  if (config.has('ncuxg')) {
    const { username, password, isp } = config.get('ncuxg') as NCUXGAccount

    text += outdent({ trimLeadingNewline: false })`
      ${chalk.blue(`${AP['ncuxg'].name} Account:`)}
        Username: ${username}
        Password: ${password}
        ISP: ${ISP[isp]} (${isp})
    `
  }

  if (config.has('ncuwlan')) {
    const { username, password } = config.get('ncuwlan') as Account

    text += outdent({ trimLeadingNewline: false })`
      ${chalk.blue(`${AP['ncuwlan'].name} Account:`)}
        Username: ${username}
        Password: ${password}
    `
  }

  const check = (config.get('check') as number) / 1000
  const retry = (config.get('retry') as number) / 1000
  text += outdent({ trimLeadingNewline: false })`
    ${chalk.blue('Check network connection:')} every ${check}s
    ${chalk.blue('Retry after connection failure:')} in ${retry}s
  `

  return text
}

try {
  const args = arg({
    '--account': [String],
    '--check': Number,
    '--retry': Number,
    '--config': Boolean,
    '--help': Boolean,
    '--version': Boolean,
    // Aliases
    '-a': '--account',
    '-c': '--config',
    '-h': '--help',
    '-v': '--version'
  })
  const accounts = args['--account']
  const check = args['--check']
  const retry = args['--retry']

  // No argument (`args === { _: [] }`)
  if (Object.keys(args).length === 1) connect().then(msg => log(msg, true))

  if (accounts) for (const account of accounts) log(setAccount(account))
  if (check) log(setCheck(check))
  if (retry) log(setRetry(retry))

  if (args['--config']) log(showConfig())
  if (args['--help'])
    log(`
      ${chalk.blue('Usage:')} ncu-net [options]

      ${chalk.blue('Options:')}
        -a, --account <string>  Set account(s)
        --check <number>        Set check interval
        --retry <number>        Set retry timeout
        -c, --config            Output current config
        -h, --help              Output help info
        -v, --version           Output current version
    `)
  if (args['--version']) log(`${chalk.blue('NCU Net version')} ${version}`)
} catch (err) {
  log(err)
}

export { setAccount, setCheck, setRetry, showConfig }
