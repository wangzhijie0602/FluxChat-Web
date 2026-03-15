import request from '@/utils/request'
import type { LoginRequest, RegisterRequest, ResultLoginResponse, ResultUserProfile } from '@/model'

export function postApiAuthLogin(loginRequest: LoginRequest) {
  return request.post<ResultLoginResponse, ResultLoginResponse>('/auth/login', loginRequest)
}

export function postApiAuthRegister(registerRequest: RegisterRequest) {
  return request.post<ResultUserProfile, ResultUserProfile>('/auth/register', registerRequest)
}
