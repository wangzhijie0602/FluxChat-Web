import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

interface ApiErrorBody {
  message?: string
}

const TOKEN_STORAGE_KEY = 'fluxchat_token'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
})

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    if (config.data && !(config.data instanceof FormData) && !config.headers.has('Content-Type')) {
      config.headers.set('Content-Type', 'application/json')
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

request.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status
    const serverMessage = error.response?.data?.message
    let message = serverMessage ?? error.message ?? '请求失败，请稍后重试。'

    if (status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      message = serverMessage ?? '登录已过期，请重新登录。'
    } else if (status === 403) {
      message = serverMessage ?? '没有权限执行该操作。'
    } else if (status === 404) {
      message = serverMessage ?? '请求资源不存在。'
    } else if (status && status >= 500) {
      message = serverMessage ?? '服务器开小差了，请稍后重试。'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export default request
