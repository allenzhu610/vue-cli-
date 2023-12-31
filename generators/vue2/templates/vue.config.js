const autoprefixer = require('autoprefixer')
/*$_ if (isH5) { _$*/
const postcssPxtorem = require('postcss-pxtorem')
/*$_ } _$*/
const _ = require('lodash')
const { join } = require('path')
const env = process.env
const isDev = env.VUE_APP_ENV === 'dev'

/* 当代理的前缀为空时 */
if (isDev) {
  const isEmpty = prefix => prefix === '' || prefix === '/'
  if (isEmpty(env.VUE_APP_BASEURL_API)) env.VUE_APP_BASEURL_API = '/@API'
}

/**
 * @type {import('@vue/cli-service').ConfigFunction}
 */
module.exports = () => ({
  devServer: {
    /* 更详细的配置规则：https://webpack.docschina.org/configuration/dev-server/#devserver-proxy */
    proxy: {
      [env.VUE_APP_BASEURL_API]: {
        pathRewrite: { '^/(api|@API)': '' },
        target: env.DEV_PROXY_TARGET_API,
      },
    },
    host: 'localhost', // 需要内网的其它机器也能访问时，将值改成 '0.0.0.0'
  },

  assetsDir: 'static-hash',

  publicPath: env.BASE_URL,

  css: {
    extract: false,
    requireModuleExtension: true,
    loaderOptions: {
      css: {
        modules: {
          localIdentName:
            isDev || env.VUE_APP_ENV === 'stage'
              ? '[path][name]__[local]__[hash:base64:5]'
              : '[name]__[local]__[hash:base64:5]',
        },
      },
      less: {
        globalVars: {
          hack: `true; @import '${join(__dirname, './src/styles/vars.less')}'`,
        },
      },
      postcss: {
        plugins: function({ resourcePath: path }) {
          /*$_ if (isH5) { _$*/
          const pxtorem = postcssPxtorem({ propList: ['*'] })
          /*$_ } _$*/
          if (
            /* 跳过 autoprefixer */
            /[\\/]node_modules[\\/].+\.css$/.test(path) ||
            /[\\/]src[\\/]libs[\\/].+\.css$/.test(path) ||
            (isDev && env.DEV_CSS_AUTOPREFIXER !== 'true')
          ) {
            return /*$= isH5 ? '[pxtorem]' : '[]' $*/
          }
          return /*$= isH5 ? '[pxtorem, autoprefixer]' : '[autoprefixer]' $*/
        },
      },
    },
    sourceMap: isDev ? env.DEV_CSS_SOURCEMAP === 'true' : false,
  },

  productionSourceMap: env.VUE_APP_ENV === 'stage',

  configureWebpack: config => {
    if (isDev) config.devtool = 'source-map'
    config.optimization.splitChunks.cacheGroups.vendors.test = module => {
      const { resource: path } = module
      if (!path) return false
      if (
        /* 为了 chunk-vendors*.js 的稳定性，需要排除掉经过 babel 插件处理成按需引入的模块（详见 babel.config.js） */
        /*$_ if (isPC) { _$*/
        /[\\/]node_modules[\\/]element-ui[\\/]/.test(path) || // @PC.element-ui
        /*$_ } _$*/
        /*$_ if (isH5) { _$*/
        /[\\/]node_modules[\\/]vant[\\/]/.test(path) || // @H5.vant
        /*$_ } _$*/
        /[\\/]node_modules[\\/]lodash[\\/]/.test(path)
      ) {
        return false
      }
      return /[\\/]node_modules[\\/]|[\\/]src[\\/]libs[\\/]/.test(path) // 将这些初始化时的依赖包纳入 chunk-vendors*.js（其它的则纳入 app*.js）
    }
  },

  chainWebpack: config => {
    /* 跳过 babel-loader */
    config.module.rule('js').exclude.add(path => {
      return /[\\/]src[\\/]libs[\\/].+\.js$/.test(path)
    })

    const svgSpriteIconsDir = join(__dirname, './src/components/SvgIcon/icons/')
    config.module.rule('svg').exclude.add(svgSpriteIconsDir)
    config.module
      .rule('svg-sprite')
      .after('svg')
      .test(/\.(svg)(\?.*)?$/)
      .include.add(svgSpriteIconsDir)
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({ symbolId: 'svgSpriteIcon__[name]' })
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      
    /*$_ if (isH5) { _$*/
    /* @H5.vant */
    const vant = config.module
      .rule('less')
      .oneOf('vant')
      .before('vue-modules')
      .test(/[\\/]node_modules[\\/]vant[\\/]/)
    config.module
      .rule('less')
      .oneOf('normal')
      .toConfig()
      .use.forEach(({ __useName, loader, options = {} }) => {
        const ops = _.cloneDeep(options)
        if (__useName === 'less-loader') {
          delete ops.globalVars
          ops.modifyVars = {
            hack: `true; @import '${join(__dirname, './src/vant/vars.less')}'`,
          }
        }
        vant
          .use(__useName)
          .loader(loader)
          .options(ops)
      })
      
    /*$_ } _$*/
    if (config.plugins.has('copy')) {
      config.plugin('copy').tap(args => {
        args[0][0].ignore.push('.eslintrc.js', '.prettierrc.js')
        args[0][0].transform = function(content, path) {
          if (
            /* 让 public 中的其它文件也支持 EJS 语法（传入运行时可用的环境变量） */
            /\.(html|htm|js|json)$/.test(path) &&
            /[\\/]public[\\/]libs[\\/]/.test(path) === false
          ) {
            const options = {
              interpolate: /<%=([\s\S]+?)%>/g,
              sourceURL: path,
            }
            const obj = _.pickBy(env, (val, key) =>
              /^(NODE_ENV|BASE_URL|VUE_APP_.*)$/.test(key),
            )
            content = _.template(`${content}`, options)(obj)
          }
          return content
        }
        return args
      })
    }
  },
})

if (env.NODE_ENV) {
  if (
    /^(development|production|test)$/.test(env.NODE_ENV) === false ||
    /^(dev|stage|prod)$/.test(env.VUE_APP_ENV) === false ||
    (env.NODE_ENV === 'development' && env.VUE_APP_ENV !== 'dev') ||
    (env.NODE_ENV === 'production' && env.VUE_APP_ENV === 'dev') ||
    (env.NODE_ENV === 'production' && env.VUE_APP_MOCK === undefined) ||
    (env.NODE_ENV === 'production' && env.VUE_APP_ENABLE_DOCS === undefined)
  ) {
    throw new Error('环境变量配置错误或不兼容或缺失')
  }
}
