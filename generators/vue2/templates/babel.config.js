module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],

  plugins: [
    /*$_ if (isPC) { _$*/
    /* @PC.element-ui */
    /* element-ui 按需引入，详情：https://github.com/ElementUI/babel-plugin-component */
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk', // 单独引用了完整的主题包时，把该行替换为 style: false
      },
      'element-ui',
    ],
    
    /*$_ } _$*/
    /*$_ if (isH5) { _$*/
    /* @H5.vant */
    /* vant 按需引入，详情：https://github.com/ElementUI/babel-plugin-component */
    [
      'component',
      {
        libraryName: 'vant',
        style: 'style/less.js',
      },
      'vant',
    ],
    
    /*$_ } _$*/
    /* lodash 按需引入，详情：https://github.com/lodash/babel-plugin-lodash */
    ['lodash'],
  ],
}
