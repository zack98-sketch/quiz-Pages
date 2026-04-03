<template>
  <div id="app">
    <nav class="bottom-nav" v-if="showNav">
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">首页</span>
      </router-link>
      <router-link to="/practice" class="nav-item" :class="{ active: $route.path === '/practice' }">
        <span class="nav-icon">📝</span>
        <span class="nav-text">练习</span>
      </router-link>
      <router-link to="/exam" class="nav-item" :class="{ active: $route.path === '/exam' }">
        <span class="nav-icon">📋</span>
        <span class="nav-text">考试</span>
      </router-link>
      <router-link to="/ai-settings" class="nav-item" :class="{ active: $route.path === '/ai-settings' }">
        <span class="nav-icon">🤖</span>
        <span class="nav-text">AI设置</span>
      </router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = computed(() => {
  return ['/', '/practice', '/exam', '/ai-settings'].includes(route.path)
})
</script>
