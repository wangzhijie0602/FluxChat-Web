/**
 * HTTP 拦截器配置。
 *
 * 请求阶段负责补齐认证 Token 和 JSON Content-Type；
 * 响应阶段负责拆出 data，并把常见 HTTP 错误转换成 Element Plus 提示。
 */
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { clearAccessToken, getAccessToken } from './token'

/** 后端错误响应体中目前会用到的字段。 */
interface ApiErrorBody {
  message?: string
}

/** 防止同一个 axios 实例重复安装拦截器，避免一次错误弹出多条提示。 */
let installed = false

/** 为传入的 axios 实例安装项目统一请求/响应拦截器。 */
export function setupHttpInterceptors(instance: AxiosInstance) {
  if (installed) {
    return
  }

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken()

      // 有 Token 时自动携带 Bearer 认证头。
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`)
      }

      // 普通对象请求默认按 JSON 提交；FormData 保持浏览器自动生成 boundary。
      if (config.data && !(config.data instanceof FormData) && !config.headers.has('Content-Type')) {
        config.headers.set('Content-Type', 'application/json')
      }

      return config
    },
    (error: AxiosError) => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error: AxiosError<ApiErrorBody>) => {
      const status = error.response?.status
      const serverMessage = error.response?.data?.message
      let message = serverMessage ?? error.message ?? '请求失败，请稍后重试。'

      // 401 代表登录态失效，需要清掉本地 Token，后续页面可据此重新登录。
      if (status === 401) {
        clearAccessToken()
        message = serverMessage ?? '登录已过期，请重新登录。'
      } else if (status === 403) {
        message = serverMessage ?? '没有权限执行该操作。'
      } else if (status === 404) {
        message = serverMessage ?? '请求资源不存在。'
      } else if (status && status >= 500) {
        message = serverMessage ?? '服务暂时不可用，请稍后重试。'
      }

      ElMessage.error(message)
      return Promise.reject(error)
    },
  )

  installed = true
}
