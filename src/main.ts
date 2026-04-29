/**
 * 应用入口文件。
 *
 * 这里负责创建 Vue 应用实例，并挂载全局能力：
 * - Pinia：集中式状态管理
 * - Vue Router：页面路由
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/** 根应用实例，所有插件都在挂载前注册到它上面。 */
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
