/**
 * Orval 使用的自定义请求实例。
 *
 * Orval 生成的接口函数会调用 customInstance。这里把生成代码接入项目自己的 axios 实例，
 * 从而复用 baseURL、超时时间、认证 Token 和错误提示等统一配置。
 */
import type { AxiosRequestConfig } from 'axios'
import httpInstance from './instance'
import { setupHttpInterceptors } from './interceptors'

setupHttpInterceptors(httpInstance)

/**
 * 合并 Orval 传入的请求配置和调用方额外配置后发起请求。
 *
 * headers 单独合并，避免 options.headers 覆盖掉生成接口里的 Content-Type 等字段。
 */
export function customInstance<T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> {
  return httpInstance({
    ...config,
    ...options,
    headers: {
      ...(config.headers ?? {}),
      ...(options?.headers ?? {}),
    },
  }) as Promise<T>
}
