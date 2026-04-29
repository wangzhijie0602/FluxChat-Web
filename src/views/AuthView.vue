<!--
  登录/注册页面。

  这个单文件组件同时承载两种认证表单：
  - login：收集账号和密码，调用登录接口并保存 token
  - register：收集注册信息，注册成功后切回登录表单
-->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { isBusinessSuccess, loginApi, registerApi } from '@/api/modules/auth'
import type { LoginRequest, RegisterRequest } from '@/api/generated/model'
import { setAccessToken } from '@/http/token'

/** 页面当前展示的表单模式。 */
type Mode = 'login' | 'register'

/** 当前表单模式，默认展示登录。 */
const mode = ref<Mode>('login')
/** 页面底部反馈提示文案。 */
const feedback = ref('')
/** 反馈提示类型，驱动 Element Plus Alert 的样式。 */
const feedbackType = ref<'success' | 'error'>('success')
/** 防止登录/注册请求重复提交。 */
const submitting = ref(false)

/** 登录表单状态。 */
const loginForm = reactive({
  account: '',
  password: '',
  remember: false,
})

/** 注册表单状态。 */
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

/** 统一设置页面反馈提示。 */
function showMessage(type: 'success' | 'error', text: string) {
  feedbackType.value = type
  feedback.value = text
}

/** 在登录和注册表单之间切换，并清空旧提示。 */
function switchMode(nextMode: Mode) {
  mode.value = nextMode
  feedback.value = ''
}

/** 校验登录表单、调用登录接口，并在成功后保存访问令牌。 */
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
    const result = await loginApi(payload)

    if (!isBusinessSuccess(result.code)) {
      showMessage('error', result.message ?? '登录失败，请检查账号和密码。')
      return
    }

    const token = result.data?.tokenInfo?.tokenValue
    if (token) {
      setAccessToken(token)
    }

    showMessage('success', '登录成功。')
  } catch {
    if (!feedback.value) {
      showMessage('error', '登录失败，请稍后重试。')
    }
  } finally {
    submitting.value = false
  }
}

/** 校验注册表单、调用注册接口，并在成功后引导用户回到登录表单。 */
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
    showMessage('error', '请完整填写用户名、邮箱、密码和确认密码。')
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
    const result = await registerApi(payload)

    if (!isBusinessSuccess(result.code)) {
      showMessage('error', result.message ?? '注册失败，请稍后重试。')
      return
    }

    loginForm.account = payload.username || payload.email || ''
    loginForm.password = ''
    loginForm.remember = false

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
            <ElFormItem label="确认密码" required>
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
/* 页面容器：让认证卡片在视口中居中。 */
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #fff;
  padding: 24px;
}

/* 认证表单卡片：承载登录和注册两种状态。 */
.auth-card {
  width: min(420px, 100%);
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  padding: 28px 24px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06);
  background: #fff;
}

/* 品牌标题。 */
.brand {
  margin: 0 0 16px;
  text-align: center;
  font-size: 32px;
  font-weight: 700;
}

/* Element Plus 表单的局部布局微调。 */
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

/* 登录/注册表单切换时的轻量过渡动画。 */
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
