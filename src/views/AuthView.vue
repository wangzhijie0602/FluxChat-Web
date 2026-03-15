<script setup lang="ts">
import { reactive, ref } from 'vue'
import { postApiAuthLogin, postApiAuthRegister } from '@/api/auth'
import type { LoginRequest, RegisterRequest } from '@/model'
import { setAccessToken } from '@/utils/request'

type Mode = 'login' | 'register'

const mode = ref<Mode>('login')
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')
const submitting = ref(false)

const loginForm = reactive({
  account: '',
  password: '',
  remember: false,
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

function showMessage(type: 'success' | 'error', text: string) {
  feedbackType.value = type
  feedback.value = text
}

function switchMode(nextMode: Mode) {
  mode.value = nextMode
  feedback.value = ''
}

// 兼容后端常见返回规范：code 缺省/0/2xx 都视为业务成功。
function isBusinessSuccess(code?: number) {
  return code === undefined || code === 0 || (code >= 200 && code < 300)
}

async function submitLogin() {
  if (submitting.value) {
    return
  }

  if (!loginForm.account.trim() || !loginForm.password) {
    showMessage('error', '请输入账号和密码。')
    return
  }

  const payload: LoginRequest = {
    account: loginForm.account.trim(),
    password: loginForm.password,
  }

  submitting.value = true
  feedback.value = ''

  try {
    const result = await postApiAuthLogin(payload)

    if (!isBusinessSuccess(result.code)) {
      showMessage('error', result.message ?? '登录失败，请检查账号和密码。')
      return
    }

    // 登录成功后缓存 token，后续请求会在 axios 请求拦截器里自动带上。
    const token = result.data?.tokenInfo?.tokenValue
    if (token) {
      setAccessToken(token)
    }

    showMessage('success', loginForm.remember ? '登录成功，已选择记住密码。' : '登录成功。')
  } catch {
    if (!feedback.value) {
      showMessage('error', '登录失败，请稍后重试。')
    }
  } finally {
    submitting.value = false
  }
}

async function submitRegister() {
  if (submitting.value) {
    return
  }

  if (
    !registerForm.username.trim() ||
    !registerForm.email.trim() ||
    !registerForm.password ||
    !registerForm.confirmPassword
  ) {
    showMessage('error', '请完整填写用户名、邮箱、密码和重复密码。')
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    showMessage('error', '两次输入的密码不一致。')
    return
  }

  const payload: RegisterRequest = {
    username: registerForm.username.trim(),
    email: registerForm.email.trim(),
    password: registerForm.password,
    confirmPassword: registerForm.confirmPassword,
  }

  submitting.value = true
  feedback.value = ''

  try {
    const result = await postApiAuthRegister(payload)

    if (!isBusinessSuccess(result.code)) {
      showMessage('error', result.message ?? '注册失败，请稍后重试。')
      return
    }

    // 注册成功后将账号预填到登录表单，降低下一步登录输入成本。
    loginForm.account = payload.username || payload.email || ''
    loginForm.password = ''
    loginForm.remember = false

    // 清空注册表单，避免回切注册页时残留敏感信息。
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''

    mode.value = 'login'
    showMessage('success', result.message ?? '注册成功，请使用账号和密码登录。')
  } catch {
    if (!feedback.value) {
      showMessage('error', '注册失败，请稍后重试。')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1 class="brand">FluxChat</h1>
      <Transition name="form-slide" mode="out-in">
        <div v-if="mode === 'login'" key="login">
          <ElForm
            :model="loginForm"
            label-position="top"
            class="auth-form"
            @submit.prevent="submitLogin"
          >
            <h2>登录</h2>
            <ElFormItem label="账号（用户名或邮箱）" required>
              <ElInput
                v-model.trim="loginForm.account"
                placeholder="请输入用户名或邮箱"
                autocomplete="username"
                clearable
                :disabled="submitting"
              />
            </ElFormItem>
            <ElFormItem label="密码" required>
              <ElInput
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="current-password"
                show-password
                :disabled="submitting"
              />
            </ElFormItem>
            <ElFormItem class="remember-item">
              <ElCheckbox v-model="loginForm.remember" :disabled="submitting">记住密码</ElCheckbox>
            </ElFormItem>
            <ElFormItem class="submit-item">
              <ElButton
                type="primary"
                class="submit-btn"
                native-type="submit"
                :loading="submitting"
                :disabled="submitting"
              >
                登录
              </ElButton>
            </ElFormItem>
          </ElForm>
          <p class="switch-row">
            还没有账号？
            <ElButton
              type="primary"
              link
              class="switch-btn"
              :disabled="submitting"
              @click="switchMode('register')"
            >
              去注册
            </ElButton>
          </p>
        </div>

        <div v-else key="register">
          <ElForm
            :model="registerForm"
            label-position="top"
            class="auth-form"
            @submit.prevent="submitRegister"
          >
            <h2>注册</h2>
            <ElFormItem label="用户名" required>
              <ElInput
                v-model.trim="registerForm.username"
                placeholder="请输入用户名"
                autocomplete="username"
                clearable
                :disabled="submitting"
              />
            </ElFormItem>
            <ElFormItem label="邮箱" required>
              <ElInput
                v-model.trim="registerForm.email"
                type="email"
                placeholder="请输入邮箱"
                autocomplete="email"
                clearable
                :disabled="submitting"
              />
            </ElFormItem>
            <ElFormItem label="密码" required>
              <ElInput
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="new-password"
                show-password
                :disabled="submitting"
              />
            </ElFormItem>
            <ElFormItem label="重复密码" required>
              <ElInput
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                autocomplete="new-password"
                show-password
                :disabled="submitting"
              />
            </ElFormItem>
            <ElFormItem class="submit-item">
              <ElButton
                type="primary"
                class="submit-btn"
                native-type="submit"
                :loading="submitting"
                :disabled="submitting"
              >
                注册
              </ElButton>
            </ElFormItem>
          </ElForm>
          <p class="switch-row">
            已有账号？
            <ElButton
              type="primary"
              link
              class="switch-btn"
              :disabled="submitting"
              @click="switchMode('login')"
            >
              去登录
            </ElButton>
          </p>
        </div>
      </Transition>

      <ElAlert
        v-if="feedback"
        class="feedback"
        :title="feedback"
        :type="feedbackType"
        :closable="false"
        show-icon
      />
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #fff;
  padding: 24px;
}

.auth-card {
  width: min(420px, 100%);
  border: 1px solid #e7e7e7;
  border-radius: 16px;
  padding: 28px 24px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.brand {
  margin: 0 0 16px;
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.auth-form {
  margin-top: 8px;
}

.auth-form h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.remember-item {
  margin-bottom: 12px;
}

.submit-item {
  margin-bottom: 4px;
}

.submit-btn {
  width: 100%;
  height: 42px;
  font-size: 15px;
  font-weight: 600;
}

.switch-row {
  margin: 4px 0 0;
  font-size: 14px;
  color: #555;
}

.switch-btn {
  padding: 0;
  vertical-align: baseline;
}

.feedback {
  margin: 14px 0 0;
}

.form-slide-enter-active,
.form-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.form-slide-enter-from {
  opacity: 0;
  transform: translateX(18px);
}

.form-slide-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}

</style>
