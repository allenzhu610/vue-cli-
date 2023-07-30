import 'normalize.css'
import './styles/reset.less'
import Vue from 'vue'
import './catchError'
/*$_ if (isPC) { _$*/
import './element-ui' // @PC.element-ui
/*$_ } _$*/
/*$_ if (isH5) { _$*/
import './vant' // @H5.vant
/*$_ } _$*/
import './styles/global.less'
import router from './router'
import store from './store'
import './injects'
import App from './App.vue'

/* 条件编译 (必须是运行时可用的环境变量，并且变量值不能为 undefined，否则模块必定会打包) */
if (process.env.VUE_APP_MOCK === 'true') {
  require('./api/mock')
}
/*$_ if (isH5) { _$*/
if (process.env.VUE_APP_ENV === 'dev' || process.env.VUE_APP_ENV === 'stage') {
  require('./vconsole')
}
/*$_ } _$*/

Vue.config.devtools =
  process.env.VUE_APP_ENV === 'dev' || process.env.VUE_APP_ENV === 'stage'
Vue.config.silent = process.env.VUE_APP_ENV === 'prod'
Vue.config.productionTip = false

export default new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#/*$= name $*/')
