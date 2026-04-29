/**
 * 认证业务接口封装。
 *
 * generated 目录中的代码由 OpenAPI/Orval 生成，本文件在其上做一层业务友好的包装：
 * - 统一解析后端返回体
 * - 暴露登录/注册请求类型
 * - 把业务成功码判断集中到一个函数中
 */
import {
  login as generatedLogin,
  register as generatedRegister,
} from '@/api/generated/auth-controller/auth-controller'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/api/generated/model'

export type { LoginRequest, LoginResponse, RegisterRequest } from '@/api/generated/model'

/** 后端通用响应结构。不同接口的 data 字段通过泛型 T 表示。 */
export interface ApiResult<T = unknown> {
  /** 业务状态码；约定 undefined、0、2xx 都视为成功。 */
  code?: number
  /** 后端返回的人类可读提示文案。 */
  message?: string
  /** 接口真正的数据载荷。 */
  data?: T
  /** 后端生成响应的时间戳。 */
  timestamp?: number
}

/** 登录接口解析后的标准响应。 */
export type LoginApiResult = ApiResult<LoginResponse>
/** 注册接口解析后的标准响应。当前注册接口没有明确 data 结构。 */
export type RegisterApiResult = ApiResult<unknown>

/** Orval 生成代码可能返回 Blob、字符串或已解析对象，这里统一纳入处理范围。 */
type ApiPayload<T> = Blob | ApiResult<T> | string | null | undefined

/** 判断后端业务码是否代表成功。 */
export function isBusinessSuccess(code?: number) {
  return code === undefined || code === 0 || (code >= 200 && code < 300)
}

/** 将文本响应解析成 ApiResult；非 JSON 文本会被当作 message 使用。 */
function parseTextApiResponse<T>(text: string): ApiResult<T> {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return {}
  }

  try {
    return JSON.parse(trimmedText) as ApiResult<T>
  } catch {
    return { message: trimmedText }
  }
}

/** 把 Orval/axios 返回的各种响应形态统一转换成 ApiResult。 */
export async function parseApiResponse<T>(payload: ApiPayload<T>): Promise<ApiResult<T>> {
  if (!payload) {
    return {}
  }

  if (payload instanceof Blob) {
    const text = await payload.text()
    return parseTextApiResponse<T>(text)
  }

  if (typeof payload === 'string') {
    return parseTextApiResponse<T>(payload)
  }

  return payload
}

/** 调用登录接口，并返回已规范化的响应结构。 */
export async function loginApi(payload: LoginRequest) {
  return parseApiResponse<LoginResponse>(await generatedLogin(payload))
}

/** 调用注册接口，并返回已规范化的响应结构。 */
export async function registerApi(payload: RegisterRequest) {
  return parseApiResponse<unknown>(await generatedRegister(payload))
}
