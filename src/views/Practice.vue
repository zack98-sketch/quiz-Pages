<template>
  <div class="container practice-page">
    <!-- 模式选择 -->
    <div v-if="!started" class="mode-select">
      <h2 class="page-title">选择练习模式</h2>
      
      <div class="select-list">
        <div class="select-item" @click="startRandom">
          <span class="select-icon">🎲</span>
          <div class="select-info">
            <span class="select-name">随机练习</span>
            <span class="select-desc">系统随机抽取10道题</span>
          </div>
          <span class="select-arrow">›</span>
        </div>
        
        <div class="select-item" @click="$router.push('/chapter')">
          <span class="select-icon">📖</span>
          <div class="select-info">
            <span class="select-name">章节练习</span>
            <span class="select-desc">按章节针对性练习</span>
          </div>
          <span class="select-arrow">›</span>
        </div>
        
        <div class="select-item" @click="$router.push('/type')">
          <span class="select-icon">📝</span>
          <div class="select-info">
            <span class="select-name">题型练习</span>
            <span class="select-desc">按题型专项训练</span>
          </div>
          <span class="select-arrow">›</span>
        </div>
        
        <div class="select-item" @click="startFavorite">
          <span class="select-icon">⭐</span>
          <div class="select-info">
            <span class="select-name">收藏练习</span>
            <span class="select-desc">练习收藏的题目</span>
          </div>
          <span class="select-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- 答题中 -->
    <div v-else-if="started && !finished" class="question-section">
      <!-- 进度 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</div>

      <!-- 题目卡片 -->
      <div class="question-card card">
        <div class="question-header">
          <span class="tag" :class="typeClass">{{ currentQuestion.type }}</span>
          <button class="fav-btn" @click="toggleFavorite">
            {{ isFav ? '❤️' : '🤍' }}
          </button>
        </div>
        
        <div class="question-text">{{ currentQuestion.question }}</div>
        
        <div class="options-list">
          <div 
            v-for="(opt, index) in currentQuestion.options" 
            :key="index"
            class="option-item"
            :class="getOptionClass(index)"
            @click="selectOption(index)"
          >
            <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
            <span class="option-text">{{ opt }}</span>
            <span v-if="showAnswer && isCorrectOption(index)" class="mark correct">✓</span>
            <span v-if="showAnswer && isWrongOption(index)" class="mark wrong">✗</span>
          </div>
        </div>

        <!-- 答案解析 -->
        <div v-if="showAnswer" class="answer-section">
          <div class="answer-info">
            <span class="answer-label">正确答案：</span>
            <span class="answer-value">{{ currentQuestion.answer }}</span>
          </div>
          <div class="analysis" v-if="currentQuestion.analysis">
            <span class="analysis-label">解析：</span>
            <span class="analysis-text">{{ currentQuestion.analysis }}</span>
          </div>
          
          <!-- AI解析 -->
          <button class="btn btn-outline btn-block ai-btn" @click="getAIAnalysis" :disabled="aiLoading">
            {{ aiLoading ? 'AI分析中...' : '🤖 AI深度解析' }}
          </button>
          <div v-if="aiResult" class="ai-result">
            <div class="ai-header">🤖 AI智能解析</div>
            <div class="ai-content">{{ aiResult }}</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-btns">
        <button v-if="!showAnswer" class="btn btn-primary btn-block" @click="submitAnswer" :disabled="!userAnswer">
          确认答案
        </button>
        <button v-else-if="currentIndex < questions.length - 1" class="btn btn-success btn-block" @click="nextQuestion">
          下一题
        </button>
        <button v-else class="btn btn-success btn-block" @click="finishPractice">
          完成练习
        </button>
      </div>
    </div>

    <!-- 完成页面 -->
    <div v-else class="result-section">
      <div class="result-card card">
        <div class="result-icon">{{ result.accuracy >= 60 ? '🎉' : '😢' }}</div>
        <h2 class="result-title">练习完成</h2>
        <div class="result-stats">
          <div class="result-item">
            <span class="result-value correct">{{ result.correctCount }}</span>
            <span class="result-label">正确</span>
          </div>
          <div class="result-item">
            <span class="result-value wrong">{{ result.wrongCount }}</span>
            <span class="result-label">错误</span>
          </div>
          <div class="result-item">
            <span class="result-value">{{ result.accuracy }}%</span>
            <span class="result-label">正确率</span>
          </div>
        </div>
        <div class="result-btns">
          <button class="btn btn-primary btn-block" @click="restart">再来一次</button>
          <button class="btn btn-outline btn-block" @click="$router.push('/')">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRandom, getByChapter, getByType, getFavorites, isFavorite, addFavorite, removeFavorite, updateProgress, addHistory } from '../utils/quizUtils.js'
import { analyzeQuestion } from '../utils/aiService.js'

const route = useRoute()
const router = useRouter()

const started = ref(false)
const finished = ref(false)
const questions = ref([])
const currentIndex = ref(0)
const userAnswer = ref('')
const showAnswer = ref(false)
const isFav = ref(false)
const aiLoading = ref(false)
const aiResult = ref('')

const result = ref({ correctCount: 0, wrongCount: 0, accuracy: 0 })

const currentQuestion = computed(() => questions.value[currentIndex.value])
const progressPercent = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100)
const typeClass = computed(() => {
  const map = { '单选题': 'tag-single', '多选题': 'tag-multi', '判断题': 'tag-judge' }
  return map[currentQuestion.value?.type] || ''
})

function getOptionClass(index) {
  const letter = String.fromCharCode(65 + index)
  const classes = []
  if (userAnswer.value && userAnswer.value.includes(letter)) {
    classes.push('active')
  }
  if (showAnswer.value) {
    if (currentQuestion.value.answer.includes(letter)) {
      classes.push('correct')
    } else if (userAnswer.value && userAnswer.value.includes(letter) && !currentQuestion.value.answer.includes(letter)) {
      classes.push('wrong')
    }
  }
  return classes.join(' ')
}

function isCorrectOption(index) {
  const letter = String.fromCharCode(65 + index)
  return currentQuestion.value.answer.includes(letter)
}

function isWrongOption(index) {
  const letter = String.fromCharCode(65 + index)
  return userAnswer.value && userAnswer.value.includes(letter) && !currentQuestion.value.answer.includes(letter)
}

function selectOption(index) {
  if (showAnswer.value) return
  const letter = String.fromCharCode(65 + index)
  if (currentQuestion.value.type === '多选题') {
    if (userAnswer.value.includes(letter)) {
      userAnswer.value = userAnswer.value.replace(letter, '')
    } else {
      userAnswer.value = (userAnswer.value + letter).split('').sort().join('')
    }
  } else {
    userAnswer.value = letter
  }
}

function submitAnswer() {
  if (!userAnswer.value) return
  
  let isCorrect = false
  if (currentQuestion.value.type === '多选题') {
    isCorrect = userAnswer.value.split('').sort().join('') === currentQuestion.value.answer.split('').sort().join('')
  } else {
    isCorrect = userAnswer.value === currentQuestion.value.answer
  }
  
  if (isCorrect) {
    result.value.correctCount++
  } else {
    result.value.wrongCount++
  }
  
  updateProgress(currentQuestion.value.id, isCorrect, currentQuestion.value.chapterId, currentQuestion.value.typeId)
  showAnswer.value = true
}

function nextQuestion() {
  currentIndex.value++
  userAnswer.value = ''
  showAnswer.value = false
  isFav.value = isFavorite(currentQuestion.value.id)
  aiResult.value = ''
}

function finishPractice() {
  result.value.accuracy = Math.round((result.value.correctCount / questions.value.length) * 100)
  addHistory({ type: '练习', correct: result.value.correctCount, accuracy: result.value.accuracy })
  finished.value = true
}

function toggleFavorite() {
  if (isFav.value) {
    removeFavorite(currentQuestion.value.id)
  } else {
    addFavorite(currentQuestion.value.id)
  }
  isFav.value = !isFav.value
}

async function getAIAnalysis() {
  aiLoading.value = true
  aiResult.value = ''
  try {
    aiResult.value = await analyzeQuestion(
      currentQuestion.value.question,
      currentQuestion.value.options,
      userAnswer.value,
      currentQuestion.value.answer,
      currentQuestion.value.analysis
    )
  } catch (err) {
    alert(err.message)
  } finally {
    aiLoading.value = false
  }
}

function startRandom() {
  questions.value = getRandom(10)
  startPractice()
}

function startFavorite() {
  const favs = getFavorites()
  if (favs.length === 0) {
    alert('暂无收藏题目')
    return
  }
  questions.value = favs
  startPractice()
}

function startPractice() {
  started.value = true
  finished.value = false
  currentIndex.value = 0
  userAnswer.value = ''
  showAnswer.value = false
  result.value = { correctCount: 0, wrongCount: 0, accuracy: 0 }
  isFav.value = isFavorite(currentQuestion.value.id)
}

function restart() {
  questions.value = questions.value.sort(() => Math.random() - 0.5)
  startPractice()
}

onMounted(() => {
  const mode = route.query.mode
  if (mode === 'random') {
    startRandom()
  } else if (mode === 'chapter') {
    const chapterId = parseInt(route.query.chapterId)
    if (chapterId) {
      questions.value = getByChapter(chapterId).sort(() => Math.random() - 0.5)
      startPractice()
    }
  } else if (mode === 'type') {
    const typeId = parseInt(route.query.typeId)
    if (typeId) {
      questions.value = getByType(typeId).sort(() => Math.random() - 0.5)
      startPractice()
    }
  }
})

watch(() => route.query, (newQuery) => {
  if (newQuery.mode) {
    started.value = false
    finished.value = false
  }
}, { deep: true })
</script>

<style scoped>
.practice-page {
  padding-top: 20px;
}

.mode-select {
  padding: 0 4px;
}

.select-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.select-item {
  display: flex;
  align-items: center;
  background: var(--card-bg);
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.select-item:active {
  background: var(--bg-color);
}

.select-icon {
  font-size: 32px;
  margin-right: 16px;
}

.select-info {
  flex: 1;
}

.select-name {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.select-desc {
  display: block;
  font-size: 13px;
  color: var(--text-light);
}

.select-arrow {
  font-size: 24px;
  color: var(--text-light);
}

.progress-bar {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fav-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
}

.question-text {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.mark {
  margin-left: auto;
  font-weight: bold;
}

.mark.correct { color: var(--success-color); }
.mark.wrong { color: var(--danger-color); }

.answer-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.answer-info {
  margin-bottom: 12px;
}

.answer-label {
  font-weight: 500;
}

.answer-value {
  color: var(--success-color);
  font-weight: bold;
}

.analysis {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.analysis-label {
  font-weight: 500;
  color: var(--text-primary);
}

.ai-btn {
  margin-top: 16px;
}

.ai-result {
  margin-top: 16px;
  background: linear-gradient(135deg, #f5f7ff, #fff);
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  overflow: hidden;
}

.ai-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px 16px;
  font-weight: 500;
}

.ai-content {
  padding: 16px;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.action-btns {
  margin-top: 20px;
}

.result-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.result-card {
  text-align: center;
  padding: 32px;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.result-title {
  font-size: 24px;
  margin-bottom: 24px;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 24px;
}

.result-item {
  text-align: center;
}

.result-value {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
}

.result-value.correct { color: var(--success-color); }
.result-value.wrong { color: var(--danger-color); }

.result-label {
  font-size: 13px;
  color: var(--text-light);
}

.result-btns {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
