/*$_ if (isPC) { _$*/
import { Loading } from 'element-ui' // @PC.element-ui
/*$_ } _$*/
/*$_ if (isH5) { _$*/
import { Toast } from 'vant' // @H5.vant
/*$_ } _$*/

let instance = null // 单例模式
let count = 0

/**
 * @type {import('axios').AxiosInstance['exHooks'][0]}
 */
export const exShowLoading = Object.freeze({
  onBefore(config) {
    if (config.exShowLoading) {
      /*$_ if (isPC) { _$*/
      // @PC.element-ui
      if (!instance || instance.visible === false) {
        instance = Loading.service()
      }
      /*$_ } _$*/
      /*$_ if (isH5) { _$*/
      // @H5.vant
      if (!instance || instance.value === false) {
        instance = Toast.loading({})
      }
      /*$_ } _$*/
      count++
      config._exShowLoading = true
    }
  },
  onComplete(config) {
    if (config._exShowLoading) {
      if (instance) {
        count--
        if (count <= 0) {
          instance.close()
          instance = null
          count = 0
        }
      }
    }
  },
})

export default exShowLoading
