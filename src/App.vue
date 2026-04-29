<!--
  根组件。

  App.vue 保持得很薄，只负责渲染当前路由对应的页面。
  具体页面逻辑放在 src/views 下，路由配置放在 src/router/index.ts。
-->
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
