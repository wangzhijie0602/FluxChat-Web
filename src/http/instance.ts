/**
 * axios 基础实例。
 *
 * 所有 HTTP 请求共享这份配置，便于统一切换 API 地址、超时时间和拦截器。
 */
import axios from 'axios'

/** 项目级 axios 实例，baseURL 来自 .env.* 中的 VITE_API_BASE_URL。 */
const httpInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

export default httpInstance
