<template>
  <div class="container memorize-page">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>
    
    <div class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</div>
    
    <div class="question-card card" v-if="currentQuestion">
      <div class="question-header">
        <span class="tag" :class="'tag-' + ['single', 'multi', 'judge'][currentQuestion.typeId - 1]">
          {{ currentQuestion.type }}
        </span>
      </div>
      
      <div class="question-text">{{ currentQuestion.question }}</div>
      
      <div v-if="!showAnswer" class="answer-hidden" @click="showAnswer = true">
        点击查看答案
      </div>
      
      <div v-else class="answer-shown">
        <div class="answer-row">
          <span class="answer-label">正确答案：</span>
          <span class="answer-value">{{ currentQuestion.answer }}</span>
        </div>
        <div class="analysis" v-if="currentQuestion.analysis">
          <span class="analysis-label">解析：</span>
          <span class="analysis-text">{{ currentQuestion.analysis }}</span>
        </div>
      </div>
    </div>
    
    <div class="nav-btns">
      <button class="btn btn-outline" @click="prevQuestion" :disabled="currentIndex === 0">上一题</button>
      <button class="btn btn-primary" @click="nextQuestion" :disabled="currentIndex >= questions.length - 1">下一题</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllData } from '../utils/quizUtils.js'

const questions = ref([])
const currentIndex = ref(0)
const showAnswer = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value])
const progressPercent = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100)

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    showAnswer.value = false
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    showAnswer.value = false
  }
}

onMounted(() => {
  // 加载前100题用于背诵
  questions.value = getAllData().slice(0, 100)
})
</script>

<style scoped>
.memorize-page {
  padding-top: 20px;
}

.question-card {
  min-height: 300px;
}

.question-header {
  margin-bottom: 16px;
}

.question-text {
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 20px;
}

.answer-hidden {
  text-align: center;
  padding: 40px;
  background: var(--bg-color);
  border-radius: 8px;
  color: var(--primary-color);
  cursor: pointer;
}

.answer-shown {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
}

.answer-row {
  margin-bottom: 12px;
}

.answer-label {
  font-weight: 500;
}

.answer-value {
  color: var(--success-color);
  font-weight: bold;
  font-size: 18px;
}

.analysis {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.analysis-label {
  font-weight: 500;
  color: var(--text-primary);
}

.nav-btns {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.nav-btns .btn {
  flex: 1;
}
</style>
