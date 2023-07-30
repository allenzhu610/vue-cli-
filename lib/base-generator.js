const Generator = require('yeoman-generator')
const utils = require('./utils')

module.exports = class BaseGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts)
    this.conflicter = new utils.StatusConflicter(
      this.env.adapter,
      this.options.force,
    )
  }

  install() {
    this.npmInstall(
      null,
      {},
      {
        cwd: this.destinationRoot(),
      },
    )
  }

  /**
   * Wrapper for mem-fs-editor.copyTpl() to ensure consistent options
   *
   * See https://github.com/SBoudrias/mem-fs-editor/blob/master/lib/actions/copy-tpl.js
   *
   * @param {string} from
   * @param {string} to
   * @param {object} context
   * @param {object} templateOptions
   * @param {object} copyOptions
   */
  copyTemplatedFiles(
    from,
    to,
    context,
    templateOptions = {},
    copyOptions = {
      // See https://github.com/mrmlnc/fast-glob#options-1
      globOptions: {
        // Allow patterns to match filenames starting with a period (files &
        // directories), even if the pattern does not explicitly have a period
        // in that spot.
        dot: true,
        // Disable expansion of brace patterns ({a,b}, {1..3}).
        nobrace: true,
        // Disable extglob support (patterns like +(a|b)), so that extglobs
        // are regarded as literal characters.
        noext: true,
      },
    },
  ) {
    return this.fs.copyTpl(from, to, context, templateOptions, copyOptions)
  }

  _runNpmScript(projectDir, args) {
    return new Promise((resolve, reject) => {
      this.spawnCommand('npm', args, {
        // Disable stdout
        stdio: [process.stdin, 'ignore', process.stderr],
        cwd: projectDir,
      }).on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error('npm exit code: ' + code))
      })
    })
  }

  async _formatCode() {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'))
    if (pkg && pkg.scripts && pkg.scripts['lint']) {
      this.log("Running 'npm run lint' to format the code...")
      await this._runNpmScript(this.destinationPath(''), ['run', 'lint'])
    }
  }

  async end() {
    /**
     * lint code after packages installed
     */
    await this._formatCode()
    this.log()
    this.log(
      'Application %s was created in %s.',
      this.projectInfo.name,
      this.projectInfo.outdir,
    )
    this.log()
    this.log('Next steps:')
    this.log()
    this.log('$ cd ' + this.projectInfo.outdir)
    this.log('$ npm start')
    this.log()
  }
}
