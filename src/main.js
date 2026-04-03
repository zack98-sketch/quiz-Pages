import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// 路由配置
const routes = [
  { path: '/', name: 'Home', component: () => import('./views/Home.vue') },
  { path: '/practice', name: 'Practice', component: () => import('./views/Practice.vue') },
  { path: '/chapter', name: 'Chapter', component: () => import('./views/Chapter.vue') },
  { path: '/type', name: 'Type', component: () => import('./views/Type.vue') },
  { path: '/search', name: 'Search', component: () => import('./views/Search.vue') },
  { path: '/favorite', name: 'Favorite', component: () => import('./views/Favorite.vue') },
  { path: '/memorize', name: 'Memorize', component: () => import('./views/Memorize.vue') },
  { path: '/exam', name: 'Exam', component: () => import('./views/Exam.vue') },
  { path: '/ai-settings', name: 'AISettings', component: () => import('./views/AISettings.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
