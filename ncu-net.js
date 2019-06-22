#!/usr/bin/env node

const Conf = require('conf')
const program = require('commander')
const outdent = require('outdent')
const loadJsonFile = require('load-json-file')
const pkginfo = require('pkginfo')(module)
const chalk = require('chalk')

const connect = require('./connect')

const config = new Conf({
  projectName: 'ncu-net',
  defaults: { timing: { checkInterval: 3000, retryTimeout: 10000 } }
})
const split = value => value.split(',')

program
  .option('-x, --ncuxg <account>', 'Config NCU-5G/NCU-2.4G account', split)
  .option('-w, --ncuwlan <account>', 'Config NCUWLAN account', split)
  .option(
    '-t, --timing <config>',
    'Config check interval & retry timeout',
    split
  )
  .option(
    '-c, --config [file]',
    'View config or load config from provided JSON file'
  )
  .version(module.exports.version)
  .parse(process.argv)

if (program.ncuxg) {
  if (program.ncuxg.length === 3) {
    config.set({
      ncuxg: {
        username: program.ncuxg[0],
        isp: program.ncuxg[1],
        password: program.ncuxg[2]
      }
    })

    console.log(outdent`
      ${chalk.blue('NCU-5G/NCU-2.4G account:')}
      - ${chalk.bold('Username:')} ${program.ncuxg[0]}
      - ${chalk.bold('ISP:')} ${program.ncuxg[1]}
      - ${chalk.bold('Password:')} ${program.ncuxg[2]}
    `)
  } else
    console.log(chalk.red('Please provide valid NCU-5G/NCU-2.4G account info.'))
} else if (program.ncuwlan) {
  if (program.ncuwlan.length === 2) {
    config.set({
      ncuwlan: {
        username: program.ncuwlan[0],
        password: program.ncuwlan[1]
      }
    })

    console.log(outdent`
      ${chalk.blue('NCUWLAN account:')}
      - ${chalk.bold('Username:')} ${program.ncuwlan[0]}
      - ${chalk.bold('Password:')} ${program.ncuwlan[1]}
    `)
  } else console.log(chalk.red('Please provide valid NCUWLAN account info.'))
} else if (program.timing) {
  if (program.timing.length === 2) {
    config.set({
      timing: {
        checkInterval: program.timing[0],
        retryTimeout: program.timing[1]
      }
    })

    console.log(outdent`
      ${chalk.blue('Timing config:')}
      - ${chalk.bold('Check connection:')} every ${program.timing[0] / 1000} s
      - ${chalk.bold('Retry:')} in ${program.timing[1] / 1000} s
    `)
  } else console.log(chalk.red('Please provide valid timing config.'))
} else if (program.config) {
  if (program.config === true) {
    const { ncuxg, ncuwlan, timing } = config.store

    console.log(`${chalk.blue('Config file path:')} ${config.path}`)

    if (ncuxg)
      console.log(outdent`
      ${chalk.blue('NCU-5G/NCU-2.4G account:')}
      - ${chalk.bold('Username:')} ${ncuxg.username}
      - ${chalk.bold('ISP:')} ${ncuxg.isp}
      - ${chalk.bold('Password:')} ${ncuxg.password}
    `)

    if (ncuwlan)
      console.log(outdent`
      ${chalk.blue('NCUWLAN account:')}
      - ${chalk.bold('Username:')} ${ncuwlan.username}
      - ${chalk.bold('Password:')} ${ncuwlan.password}
    `)

    if (timing)
      console.log(outdent`
      ${chalk.blue('Timing config:')}
      - ${chalk.bold('Check connection:')} every ${timing.checkInterval /
        1000} s
      - ${chalk.bold('Retry:')} in ${timing.retryTimeout / 1000} s
    `)
  } else
    (async () => {
      try {
        config.store = await loadJsonFile(program.config)
        console.log(chalk.green('Successfully loaded config file.'))
      } catch (e) {
        console.log(chalk.red('Failed to load config file.'))
        console.log(chalk.red(e))
      }
    })()
} else connect()
