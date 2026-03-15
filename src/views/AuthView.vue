<script setup lang="ts">
import { reactive, ref } from 'vue'

type Mode = 'login' | 'register'

const mode = ref<Mode>('login')
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

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

function submitLogin() {
  if (!loginForm.account.trim() || !loginForm.password) {
    showMessage('error', '请输入账号和密码。')
    return
  }

  showMessage('success', loginForm.remember ? '登录成功，已选择记住密码。' : '登录成功。')
}

function submitRegister() {
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

  loginForm.account = registerForm.username.trim() || registerForm.email.trim()
  loginForm.password = ''
  loginForm.remember = false

  registerForm.username = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''

  mode.value = 'login'
  showMessage('success', '注册成功，请使用账号和密码登录。')
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1 class="brand">FluxChat</h1>
      <Transition name="form-slide" mode="out-in">
        <form v-if="mode === 'login'" key="login" @submit.prevent="submitLogin">
          <ElForm :model="loginForm" label-position="top" class="auth-form">
            <h2>登录</h2>
            <ElFormItem label="账号（用户名或邮箱）" required>
              <ElInput
                v-model.trim="loginForm.account"
                placeholder="请输入用户名或邮箱"
                autocomplete="username"
                clearable
              />
            </ElFormItem>
            <ElFormItem label="密码" required>
              <ElInput
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="current-password"
                show-password
              />
            </ElFormItem>
            <ElFormItem class="remember-item">
              <ElCheckbox v-model="loginForm.remember">记住密码</ElCheckbox>
            </ElFormItem>
            <ElFormItem class="submit-item">
              <ElButton type="primary" class="submit-btn" native-type="submit">登录</ElButton>
            </ElFormItem>
          </ElForm>
          <p class="switch-row">
            还没有账号？
            <ElButton type="primary" link class="switch-btn" @click="switchMode('register')">
              去注册
            </ElButton>
          </p>
        </form>

        <form v-else key="register" @submit.prevent="submitRegister">
          <ElForm :model="registerForm" label-position="top" class="auth-form">
            <h2>注册</h2>
            <ElFormItem label="用户名" required>
              <ElInput
                v-model.trim="registerForm.username"
                placeholder="请输入用户名"
                autocomplete="username"
                clearable
              />
            </ElFormItem>
            <ElFormItem label="邮箱" required>
              <ElInput
                v-model.trim="registerForm.email"
                type="email"
                placeholder="请输入邮箱"
                autocomplete="email"
                clearable
              />
            </ElFormItem>
            <ElFormItem label="密码" required>
              <ElInput
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="new-password"
                show-password
              />
            </ElFormItem>
            <ElFormItem label="重复密码" required>
              <ElInput
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                autocomplete="new-password"
                show-password
              />
            </ElFormItem>
            <ElFormItem class="submit-item">
              <ElButton type="primary" class="submit-btn" native-type="submit">注册</ElButton>
            </ElFormItem>
          </ElForm>
          <p class="switch-row">
            已有账号？
            <ElButton type="primary" link class="switch-btn" @click="switchMode('login')">
              去登录
            </ElButton>
          </p>
        </form>
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
