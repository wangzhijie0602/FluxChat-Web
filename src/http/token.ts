/**
 * 访问令牌本地存储工具。
 *
 * 当前项目把登录后的 tokenValue 存在 localStorage，HTTP 拦截器会读取它并写入
 * Authorization 请求头。
 */
const TOKEN_STORAGE_KEY = 'fluxchat_token'

/** 读取当前保存的访问令牌。 */
export function getAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/** 保存登录成功后得到的访问令牌。 */
export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

/** 清除本地访问令牌，常用于退出登录或 401 登录态过期。 */
export function clearAccessToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
