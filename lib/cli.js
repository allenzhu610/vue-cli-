'use strict'

const path = require('path')
const camelcaseKeys = require('camelcase-keys')
const yeoman = require('yeoman-environment')
const Generator = require('yeoman-generator')
const spawnCommand = Generator.prototype.spawnCommand

/**
 * Parse arguments and run corresponding command
 * @param env - Yeoman env
 * @param {*} opts Command options
 * @param log - Log function
 * @param dryRun - flag for dryRun (for testing)
 */
function runCommand(env, opts, log, dryRun) {
  const args = opts._
  const command = args[0]
  const supportedCommands = env.getGeneratorsMeta()
  if (Object.keys(supportedCommands).includes(command)) {
    // `yo` is adding flags converted to CamelCase
    const options = camelcaseKeys(opts, { exclude: ['--', /^\w$/, 'argv'] })
    Object.assign(options, opts)
    if (!dryRun) {
      env.run(args, options)
    }
  } else {
    printCommands(env, log)
  }
}

/**
 * Set up yeoman generators
 */
function setupGenerators() {
  const env = yeoman.createEnv()
  env.register(path.join(__dirname, '../generators/vue2'), 'vue2')
  env.register(path.join(__dirname, '../generators/vue3'), 'vue3')
  return env
}

/**
 * Print versions
 */
function printVersions(log) {
  const pkg = require('../package.json')
  const ver = pkg.version
  log('%s v%s', pkg.name, ver)
}

/**
 * Print a list of available commands
 * @param {*} env Yeoman env
 * @param log - Log function
 */
function printCommands(env, log) {
  log('Available commands: ')
  const list = ['update']
  list.push(...Object.keys(env.getGeneratorsMeta()))
  log(list.join('\n'))
}

function main(opts, log, dryRun) {
  log = log || console.log

  /* --version */
  /* -v */
  if (opts.version) {
    printVersions(log)
    return
  }

  const env = setupGenerators()

  /* --commands */
  /* -l */
  if (opts.commands) {
    printCommands(env, log)
    return
  }

  /* update */
  if (opts._[0] === 'update') {
    const args = `update sam-meng-mycli -g`
    printVersions(log)
    log(`npm ${args}`)
    spawnCommand('npm', args.split(/\s+/), {
      stdio: [process.stdin, 'ignore', process.stderr],
    }).on('close', (code) => {
      if (code === 0) {
        spawnCommand('mycli', ['-v'])
      } else {
        log('更新失败：' + code)
      }
    })
    return
  }

  /* xxx */
  runCommand(env, opts, log, dryRun)
}

module.exports = main
