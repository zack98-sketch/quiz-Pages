<template>
  <div class="container search-page">
    <div class="search-box">
      <input 
        type="text" 
        v-model="keyword" 
        placeholder="输入关键词搜索题目"
        @keyup.enter="doSearch"
      >
      <button class="btn btn-primary" @click="doSearch">搜索</button>
    </div>
    
    <div v-if="searching" class="loading">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="results.length > 0" class="results">
      <div class="result-count">找到 {{ results.length }} 道相关题目</div>
      <div class="result-list">
        <div 
          v-for="q in results" 
          :key="q.id" 
          class="result-item"
          @click="goQuestion(q)"
        >
          <span class="tag" :class="'tag-' + ['single', 'multi', 'judge'][q.typeId - 1]">{{ q.type }}</span>
          <span class="result-text">{{ q.question }}</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="keyword && searched" class="empty-state">
      <span class="empty-icon">🔍</span>
      <p>未找到相关题目</p>
    </div>
    
    <div v-else class="search-tip">
      <p>输入题目关键词、选项或解析内容进行搜索</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchQuestions } from '../utils/quizUtils.js'

const router = useRouter()
const keyword = ref('')
const results = ref([])
const searching = ref(false)
const searched = ref(false)

function doSearch() {
  if (!keyword.value.trim()) return
  searching.value = true
  setTimeout(() => {
    results.value = searchQuestions(keyword.value.trim())
    searching.value = false
    searched.value = true
  }, 300)
}

function goQuestion(q) {
  // 跳转到练习页面并带上题目ID
  router.push(`/practice?mode=single&id=${q.id}`)
}
</script>

<style scoped>
.search-page {
  padding-top: 20px;
}

.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-box input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
}

.search-box input:focus {
  border-color: var(--primary-color);
}

.result-count {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.result-list {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
}

.result-item {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.result-item:last-child {
  border-bottom: none;
}

.result-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.6;
  margin-top: 8px;
}

.search-tip {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}
</style>
