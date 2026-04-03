<template>
  <div class="container home-page">
    <!-- 顶部统计 -->
    <div class="stats-card card">
      <div class="stats-header">
        <h2>密评题库</h2>
        <span class="version">共{{ totalCount }}题</span>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ progress.totalAnswered }}</span>
          <span class="stat-label">已答题</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ accuracy }}%</span>
          <span class="stat-label">正确率</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ favoriteCount }}</span>
          <span class="stat-label">收藏</span>
        </div>
      </div>
    </div>

    <!-- 练习模式 -->
    <div class="mode-section">
      <h3 class="section-title">练习模式</h3>
      <div class="mode-grid">
        <router-link to="/practice?mode=random" class="mode-card">
          <span class="mode-icon">🎲</span>
          <span class="mode-name">随机练习</span>
          <span class="mode-desc">随机10题</span>
        </router-link>
        <router-link to="/chapter" class="mode-card">
          <span class="mode-icon">📖</span>
          <span class="mode-name">章节练习</span>
          <span class="mode-desc">按章节练习</span>
        </router-link>
        <router-link to="/type" class="mode-card">
          <span class="mode-icon">📝</span>
          <span class="mode-name">题型练习</span>
          <span class="mode-desc">按题型练习</span>
        </router-link>
        <router-link to="/search" class="mode-card">
          <span class="mode-icon">🔍</span>
          <span class="mode-name">搜索题目</span>
          <span class="mode-desc">关键词搜索</span>
        </router-link>
        <router-link to="/favorite" class="mode-card">
          <span class="mode-icon">⭐</span>
          <span class="mode-name">收藏练习</span>
          <span class="mode-desc">{{ favoriteCount }}题</span>
        </router-link>
        <router-link to="/memorize" class="mode-card">
          <span class="mode-icon">📚</span>
          <span class="mode-name">背诵模式</span>
          <span class="mode-desc">逐题浏览</span>
        </router-link>
      </div>
    </div>

    <!-- 题型统计 -->
    <div class="type-section">
      <h3 class="section-title">题型分布</h3>
      <div class="type-list">
        <div class="type-item" v-for="type in types" :key="type.id">
          <span class="type-tag" :class="'tag-' + ['single', 'multi', 'judge'][type.id - 1]">{{ type.name }}</span>
          <span class="type-count">{{ type.count }}题</span>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-section">
      <router-link to="/exam" class="quick-btn btn btn-primary btn-block">
        📋 开始模拟考试
      </router-link>
    </div>

    <!-- 最近记录 -->
    <div class="history-section" v-if="recentHistory.length > 0">
      <h3 class="section-title">最近练习</h3>
      <div class="history-list">
        <div class="history-item" v-for="(item, index) in recentHistory" :key="index">
          <span class="history-type">{{ item.type }}</span>
          <span class="history-result">正确{{ item.correct }}题</span>
          <span class="history-accuracy">{{ item.accuracy }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProgress, getTypes, getHistory } from '../utils/quizUtils.js'

const totalCount = 5075
const progress = ref({ totalAnswered: 0, correctCount: 0 })
const types = ref([])
const favoriteCount = ref(0)
const recentHistory = ref([])

const accuracy = computed(() => {
  if (progress.value.totalAnswered === 0) return 0
  return Math.round((progress.value.correctCount / progress.value.totalAnswered) * 100)
})

onMounted(() => {
  progress.value = getProgress()
  types.value = getTypes()
  favoriteCount.value = JSON.parse(localStorage.getItem('favorites') || '[]').length
  recentHistory.value = getHistory().slice(0, 5)
})
</script>

<style scoped>
.home-page {
  padding-top: 20px;
}

.stats-card {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stats-header h2 {
  font-size: 24px;
  margin: 0;
}

.version {
  font-size: 14px;
  opacity: 0.9;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.mode-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.mode-card:active {
  transform: scale(0.95);
}

.mode-icon {
  display: block;
  font-size: 32px;
  margin-bottom: 8px;
}

.mode-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.mode-desc {
  display: block;
  font-size: 12px;
  color: var(--text-light);
}

.type-section {
  margin-top: 24px;
}

.type-list {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
}

.type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.type-item:last-child {
  border-bottom: none;
}

.type-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.quick-section {
  margin-top: 24px;
}

.quick-btn {
  font-size: 16px;
  padding: 16px;
}

.history-section {
  margin-top: 24px;
}

.history-list {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.history-item:last-child {
  border-bottom: none;
}

.history-type {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.history-result {
  font-size: 14px;
  color: var(--text-secondary);
  margin-right: 16px;
}

.history-accuracy {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-color);
}
</style>
