<template>
  <div class="container favorite-page">
    <h2 class="page-title">我的收藏</h2>
    
    <div v-if="favorites.length === 0" class="empty-state">
      <span class="empty-icon">⭐</span>
      <p>暂无收藏题目</p>
      <p class="empty-tip">在做题时点击收藏按钮可将题目添加到这里</p>
    </div>
    
    <div v-else>
      <div class="fav-header">
        <span>共 {{ favorites.length }} 道收藏题目</span>
        <button class="clear-btn" @click="clearAll">清空</button>
      </div>
      
      <div class="fav-list">
        <div 
          v-for="q in favorites" 
          :key="q.id" 
          class="fav-item"
          @click="goQuestion(q)"
        >
          <span class="tag" :class="'tag-' + ['single', 'multi', 'judge'][q.typeId - 1]">{{ q.type }}</span>
          <span class="fav-text">{{ q.question }}</span>
          <span class="fav-arrow">›</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFavorites, isFavorite } from '../utils/quizUtils.js'

const router = useRouter()
const favorites = ref([])

onMounted(() => {
  loadFavorites()
})

function loadFavorites() {
  favorites.value = getFavorites()
}

function goQuestion(q) {
  router.push(`/practice?mode=single&id=${q.id}`)
}

function clearAll() {
  if (confirm('确定要清空所有收藏吗？')) {
    localStorage.setItem('favorites', '[]')
    favorites.value = []
  }
}
</script>

<style scoped>
.favorite-page {
  padding-top: 20px;
}

.fav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--text-secondary);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--danger-color);
  font-size: 14px;
  cursor: pointer;
}

.fav-list {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
}

.fav-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.fav-item:last-child {
  border-bottom: none;
}

.fav-text {
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.6;
  margin-left: 12px;
}

.fav-arrow {
  color: var(--text-light);
  margin-left: 12px;
}

.empty-tip {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 8px;
}
</style>
