const stream = require('stream')
const fs = require('fs')
const util = require('util')
const kebabCase = require('lodash/kebabCase')
const Conflicter = require('yeoman-generator/lib/util/conflicter')
const path = require('path')

exports.toFileName = (name) => kebabCase(name).replace(/\-(\d+)$/g, '$1')

exports.validatePkgName = (input) => {
  if (!input.trim()) return '必填项'
  if (!/^[a-z][\w]*$/i.test(input)) {
    return '只允许字母、数字、下划线，并且以字母开头'
  }
  return true
}

exports.validateNotExisting = function (projDir) {
  if (fs.existsSync(projDir)) {
    return util.format('Directory %s already exists.', projDir)
  }
  return true
}

/**
 * Extends conflicter so that it keeps track of conflict status
 */
exports.StatusConflicter = class StatusConflicter extends Conflicter {
  constructor(adapter, force) {
    super(adapter, force)
    this.generationStatus = {} // keeps track of file conflict history
  }

  checkForCollision(filepath, contents, callback) {
    super.checkForCollision(filepath, contents, (err, status) => {
      const filename = filepath.split('/').pop()
      this.generationStatus[filename] = status
      callback(err, status)
    })
  }
}

/**
 * Rename EJS files
 */
exports.renameEJS = function () {
  const renameStream = new stream.Transform({ objectMode: true })

  renameStream._transform = function (file, enc, callback) {
    const filePath = file.relative
    const dirname = path.dirname(filePath)
    let extname = path.extname(filePath)
    let basename = path.basename(filePath, extname)

    // 处理脚手架初始化时 .gitignore 自动变成 .npmignore 的问题
    if (basename === '_gitignore' && extname === '') {
      file.path = path.join(file.base, dirname, '.gitignore')
    }

    // extname already contains a leading '.'
    const fileName = `${basename}${extname}`
    const result = fileName.match(/(.+)(.ts|.json|.js|.md|.html)\.ejs$/)
    if (result) {
      extname = result[2]
      basename = result[1]
      file.path = path.join(file.base, dirname, basename + extname)
    }
    callback(null, file)
  }

  return renameStream
}
