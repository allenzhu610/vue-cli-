const BaseGenerator = require('../../lib/base-generator')
const utils = require('../../lib/utils')

const cliVersion = require('../../package.json').version

module.exports = class extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts)
    this._setupTransform()
    this._setupState()
    this._setupConfiguration()
  }

  _setupState() {
    this.projectInfo = {
      name: null,
      nameZh: null,
      client: null,
      outdir: null,
    }
  }

  _setupTransform() {
    /**
     * Registers a Transform Stream with Yeoman. Removes `.ejs` extension
     * from files that have it during project generation.
     */
    this.registerTransformStream(utils.renameEJS())
  }

  _setupConfiguration() {
    this.argument('name', {
      type: String,
      required: false,
      description: '项目名称',
    })

    this.option('nameZh', {
      type: String,
      description: '项目中文名称',
    })

    this.option('client', {
      type: String,
      description: '用户端侧',
    })

    this.option('outdir', {
      type: String,
      description: '输出到本地目录',
    })
  }

  async promptProjectName() {
    const props = await this.prompt([
      {
        name: 'name',
        type: 'input',
        message: '项目名称（可能作为标识符或标识符的一部分）：',
        validate: utils.validatePkgName,
      },
      {
        name: 'nameZh',
        type: 'input',
        message: '项目中文名称（作为页面默认标题）：',
        filter: (input) => input.trim(),
      },
      {
        name: 'client',
        type: 'list',
        message: '用户端侧：',
        choices: [
          { name: 'pc端', value: 'pc' },
          { name: 'h5端', value: 'h5' },
        ],
        default: 'pc',
      },
    ])
    Object.assign(this.projectInfo, props)
  }

  async promptProjectDir() {
    const props = await this.prompt([
      {
        type: 'input',
        name: 'outdir',
        message: '输出到本地目录：',
        when:
          this.projectInfo.outdir == null ||
          // prompts if option was set to a directory that already exists
          utils.validateNotExisting(this.projectInfo.outdir) !== true,
        validate: utils.validateNotExisting,
        default: utils.toFileName(this.projectInfo.name),
      },
    ])
    Object.assign(this.projectInfo, props)
  }

  scaffold() {
    const { outdir, client } = this.projectInfo

    this.destinationRoot(outdir)

    // Store original cli version in .yo.rc.json
    this.config.set('version', cliVersion)

    const ignore = []
    if (client === 'pc') {
      ignore.push(this.templatePath('src/vant/**/*'))
      ignore.push(this.templatePath('src/vconsole.js'))
    } else if (client === 'h5') {
      ignore.push(this.templatePath('src/element-ui/**/*'))
      ignore.push(this.templatePath('src/scripts/utils/dialog/**/*'))
    }

    this.copyTemplatedFiles(
      this.templatePath('**/*'),
      this.destinationPath(''),
      {
        ...this.projectInfo,
        isPC: client === 'pc',
        isH5: client === 'h5',
      },
      {
        openDelimiter: '/*',
        closeDelimiter: '*/',
        delimiter: '$',
      },
      { globOptions: { dot: true, nobrace: true, noext: true, ignore } },
    )

    this.fs.copy(this.templatePath('../plain/**/*'), this.destinationPath(''), {
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
    })
  }

  install() {
    return super.install()
  }

  end() {
    return super.end()
  }
}
