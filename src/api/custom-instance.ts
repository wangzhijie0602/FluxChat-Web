import type { AxiosRequestConfig } from 'axios'
import apiClient from './client'

export function customInstance<T>(config: AxiosRequestConfig, options?: AxiosRequestConfig) {
  return apiClient<T>({
    ...config,
    ...options,
    headers: {
      ...(config.headers ?? {}),
      ...(options?.headers ?? {}),
    },
  })
}
