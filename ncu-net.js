#!/usr/bin/env node

const Conf = require('conf')
const program = require('commander')
const outdent = require('outdent')
const loadJsonFile = require('load-json-file')
const pkginfo = require('pkginfo')(module)

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
      Your NCU-5G/NCU-2.4G account is:
      Username: ${program.ncuxg[0]}
      ISP: ${program.ncuxg[1]}
      Password: ${program.ncuxg[2]}
    `)
  } else console.log('Please provide a valid NCU-5G/NCU-2.4G account!')
} else if (program.ncuwlan) {
  if (program.ncuwlan.length === 2) {
    config.set({
      ncuwlan: {
        username: program.ncuwlan[0],
        password: program.ncuwlan[1]
      }
    })

    console.log(outdent`
      Your NCUWLAN account is:
      Username: ${program.ncuwlan[0]}
      Password: ${program.ncuwlan[1]}
    `)
  } else console.log('Please provide a valid NCUWLAN account!')
} else if (program.timing) {
  if (program.timing.length === 2) {
    config.set({
      timing: {
        checkInterval: program.timing[0],
        retryTimeout: program.timing[1]
      }
    })

    console.log(outdent`
      Your timing config is:
      Check connection: every ${program.timing[0] / 1000}s
      Retry: in ${program.timing[1] / 1000}s
    `)
  } else console.log('Please provide a valid timing config!')
} else if (program.config) {
  if (program.config === true) {
    console.log(config.path)
    console.log(config.store)
  } else
    (async () => {
      try {
        config.store = await loadJsonFile(program.config)
        console.log('Successfully loaded config file.')
      } catch (e) {
        console.log('Failed to load config file.\nAdditional error info:')
        console.log(e)
      }
    })()
} else connect()
