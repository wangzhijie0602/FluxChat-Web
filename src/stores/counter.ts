/**
 * Pinia 示例计数器 Store。
 *
 * 这是 Vue 模板项目常见的示例 Store，目前没有被认证页使用；
 * 后续可以按同样写法新增真实业务 Store。
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/** 一个演示组合式 Store 写法的计数器。 */
export const useCounterStore = defineStore('counter', () => {
  /** 当前计数值。 */
  const count = ref(0)
  /** 当前计数的两倍，随 count 自动更新。 */
  const doubleCount = computed(() => count.value * 2)
  /** 将计数加一。 */
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
