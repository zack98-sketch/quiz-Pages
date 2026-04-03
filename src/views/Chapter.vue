<template>
  <div class="container chapter-page">
    <h2 class="page-title">章节练习</h2>
    
    <div class="chapter-list">
      <router-link 
        v-for="chapter in chapters" 
        :key="chapter.id"
        :to="`/practice?mode=chapter&chapterId=${chapter.id}`"
        class="chapter-item"
      >
        <span class="chapter-name">{{ chapter.name }}</span>
        <span class="chapter-count">{{ chapter.count }}题</span>
        <span class="chapter-arrow">›</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getChapters } from '../utils/quizUtils.js'

const chapters = ref([])

onMounted(() => {
  chapters.value = getChapters()
})
</script>

<style scoped>
.chapter-page {
  padding-top: 20px;
}

.chapter-list {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
}

.chapter-item {
  display: flex;
  align-items: center;
  padding: 16px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--border-color);
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-name {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
}

.chapter-count {
  font-size: 14px;
  color: var(--text-light);
  margin-right: 12px;
}

.chapter-arrow {
  color: var(--text-light);
  font-size: 20px;
}
</style>
