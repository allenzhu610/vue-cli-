#!/usr/bin/env node
'use strict'
// Intentionally have a separate `main.js` which can use JS features
// supported by required version of Node
const minimist = require('minimist')
const main = require('../lib/cli')
const opts = minimist(process.argv.slice(2), {
  alias: {
    version: 'v', // --version or -v: print versions
    commands: 'l', // --commands or -l: print commands
  },
})

main(opts)
