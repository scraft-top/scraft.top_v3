#!/usr/bin/env node

const cp = require('child_process')
const process = require('process')
const fs = require('fs')
const path = require('path')

let result = []

let p = cp.spawnSync('git', ['--no-pager', 'log', '--pretty=format:"%cd %s"', '--date=format:"%Y-%m-%d %H:%M:%S"'],
  { shell: true, encoding: 'utf-8' })

if (p.status === 0) {
  let lines = p.stdout.split('\n')
  lines.forEach(line => {
    let m = /^([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2}) (.*)$/.exec(line)
    result.push({ date: m[0], time: m[1], commit: m[2] })
  })
}

let str = JSON.stringify(result)
console.log(str)
fs.writeFileSync(path.join(__dirname, 'dist', 'v3_static', 'v3_commits.json'), str, { encoding: 'utf-8' })

process.exit(p.status)
