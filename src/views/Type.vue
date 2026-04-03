<template>
  <div class="container type-page">
    <h2 class="page-title">题型练习</h2>
    
    <div class="type-list">
      <router-link 
        v-for="type in types" 
        :key="type.id"
        :to="`/practice?mode=type&typeId=${type.id}`"
        class="type-item"
      >
        <span class="type-icon" :class="'icon-' + ['single', 'multi', 'judge'][type.id - 1]">
          {{ ['单', '多', '判'][type.id - 1] }}
        </span>
        <div class="type-info">
          <span class="type-name">{{ type.name }}</span>
          <span class="type-count">共{{ type.count }}题</span>
        </div>
        <span class="type-arrow">›</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTypes } from '../utils/quizUtils.js'

const types = ref([])

onMounted(() => {
  types.value = getTypes()
})
</script>

<style scoped>
.type-page {
  padding-top: 20px;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-item {
  display: flex;
  align-items: center;
  background: var(--card-bg);
  padding: 16px;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
}

.type-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-right: 16px;
}

.icon-single { background: linear-gradient(135deg, #2196f3, #1976d2); }
.icon-multi { background: linear-gradient(135deg, #ff9800, #f57c00); }
.icon-judge { background: linear-gradient(135deg, #4caf50, #388e3c); }

.type-info {
  flex: 1;
}

.type-name {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.type-count {
  display: block;
  font-size: 13px;
  color: var(--text-light);
}

.type-arrow {
  color: var(--text-light);
  font-size: 20px;
}
</style>
