/**
 * 前端路由配置。
 *
 * 当前项目只有认证页：访问根路径会重定向到 /auth。
 */
import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '@/views/AuthView.vue'

/** Vue Router 实例，使用浏览器 History 模式。 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth',
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
    },
  ],
})

export default router
