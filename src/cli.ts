import arg from 'arg'
import chalk from 'chalk'
import { connect } from './connect'
import { config, version, log, AP, ISP } from '../utils'

const setAccount = (account: string) => {
  const [ap, username, password, isp] = account.split(' ')

  if (
    ((ap === 'ncuxg' && isp in ISP) || ap === 'ncuwlan') &&
    username &&
    password
  ) {
    config.set(ap, { username, password, isp: isp as keyof typeof ISP })

    return chalk.green(`Set ${AP[ap].name} account`)
  } else return Error('Please provide a valid account')
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
  log(`${chalk.blue('Config file path:')} ${config.path}`)

  if (config.has('ncuxg')) {
    const { username, password, isp } = config.get('ncuxg')!

    log(`
      ${chalk.blue(`${AP['ncuxg'].name} Account:`)}
        Username: ${username}
        Password: ${password}
        ISP: ${ISP[isp]} (${isp})
    `)
  }

  if (config.has('ncuwlan')) {
    const { username, password } = config.get('ncuwlan')!

    log(`
      ${chalk.blue(`${AP['ncuwlan'].name} Account:`)}
        Username: ${username}
        Password: ${password}
    `)
  }

  // prettier-ignore
  log(`
    ${chalk.blue('Check network connection:')} every ${config.get('check') / 1000}s
    ${chalk.blue('Retry after connection failure:')} in ${config.get('retry') / 1000}s
  `)
}

const helpText = `
  ${chalk.blue('Usage:')} ncu-net [options]

  ${chalk.blue('Options:')}
    -a, --account <string>  Set account(s)
    --check <number>        Set check interval (ms)
    --retry <number>        Set retry timeout (ms)
    -c, --config            View configuration
    -h, --help              Show command usage
    -v, --version           Show version info
`
const versionText = `${chalk.blue('NCU Net version')} ${version}`

try {
  const args = arg({
    '--account': [String],
    '--check': Number,
    '--retry': Number,
    '--config': Boolean,
    '--help': Boolean,
    '--version': Boolean,
    '-a': '--account',
    '-c': '--config',
    '-h': '--help',
    '-v': '--version'
  })
  const accounts = args['--account']
  const check = args['--check']
  const retry = args['--retry']

  // No argument (args === { _: [] })
  if (Object.keys(args).length === 1) connect()

  if (accounts) for (const account of accounts) log(setAccount(account))
  if (check) log(setCheck(check))
  if (retry) log(setRetry(retry))

  if (args['--config']) showConfig()
  if (args['--help']) log(helpText)
  if (args['--version']) log(versionText)
} catch (err) {
  log(err)
}

export { setAccount, setCheck, setRetry }
