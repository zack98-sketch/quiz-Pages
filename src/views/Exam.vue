<template>
  <div class="container exam-page">
    <!-- 设置页面 -->
    <div v-if="!started" class="setup-section">
      <h2 class="page-title">模拟考试</h2>
      
      <div class="setup-card card">
        <div class="setup-item">
          <label>题目数量</label>
          <div class="option-group">
            <button 
              v-for="count in [20, 30, 50, 100]" 
              :key="count"
              class="option-btn"
              :class="{ active: config.count === count }"
              @click="config.count = count"
            >{{ count }}题</button>
          </div>
        </div>
        
        <div class="setup-item">
          <label>考试时长</label>
          <div class="option-group">
            <button 
              v-for="time in [30, 60, 90, 120]" 
              :key="time"
              class="option-btn"
              :class="{ active: config.time === time }"
              @click="config.time = time"
            >{{ time }}分钟</button>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary btn-block" @click="startExam">开始考试</button>
    </div>
    
    <!-- 考试中 -->
    <div v-else-if="started && !finished" class="exam-section">
      <div class="exam-toolbar">
        <span class="timer" :class="{ warning: remainingTime < 300 }">{{ formatTime }}</span>
        <span class="answered">已答 {{ answeredCount }}/{{ questions.length }}</span>
        <button class="submit-btn" @click="confirmSubmit">交卷</button>
      </div>
      
      <div class="question-card card">
        <div class="question-header">
          <span>第 {{ currentIndex + 1 }} 题</span>
          <span class="tag" :class="'tag-' + ['single', 'multi', 'judge'][currentQuestion.typeId - 1]">
            {{ currentQuestion.type }}
          </span>
        </div>
        
        <div class="question-text">{{ currentQuestion.question }}</div>
        
        <div class="options-list">
          <div 
            v-for="(opt, index) in currentQuestion.options" 
            :key="index"
            class="option-item"
            :class="{ active: userAnswers[currentQuestion.id]?.includes(String.fromCharCode(65 + index)) }"
            @click="selectOption(index)"
          >
            <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
            <span class="option-text">{{ opt }}</span>
          </div>
        </div>
        
        <div class="nav-btns">
          <button class="btn btn-outline" @click="prevQuestion" :disabled="currentIndex === 0">上一题</button>
          <button class="btn btn-primary" @click="nextQuestion" :disabled="currentIndex >= questions.length - 1">下一题</button>
        </div>
      </div>
    </div>
    
    <!-- 结果页面 -->
    <div v-else class="result-section">
      <div class="result-card card">
        <div class="result-icon">{{ result.score >= 60 ? '🎉' : '😢' }}</div>
        <h2 class="result-title">{{ result.score >= 60 ? '恭喜通过！' : '未能通过' }}</h2>
        <div class="result-score">{{ result.score }}分</div>
        <p class="result-pass">及格分数：60分</p>
        
        <div class="result-stats">
          <div class="result-item">
            <span class="result-value correct">{{ result.correct }}</span>
            <span class="result-label">正确</span>
          </div>
          <div class="result-item">
            <span class="result-value wrong">{{ result.wrong }}</span>
            <span class="result-label">错误</span>
          </div>
          <div class="result-item">
            <span class="result-value">{{ result.unanswered }}</span>
            <span class="result-label">未答</span>
          </div>
        </div>
        
        <div class="result-btns">
          <button class="btn btn-primary btn-block" @click="restartExam">再次考试</button>
          <button class="btn btn-outline btn-block" @click="$router.push('/')">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getAllData, addHistory } from '../utils/quizUtils.js'

const started = ref(false)
const finished = ref(false)
const config = ref({ count: 50, time: 60 })
const questions = ref([])
const currentIndex = ref(0)
const userAnswers = ref({})
const remainingTime = ref(0)
const timer = ref(null)
const result = ref({ score: 0, correct: 0, wrong: 0, unanswered: 0 })

const currentQuestion = computed(() => questions.value[currentIndex.value])
const answeredCount = computed(() => Object.keys(userAnswers.value).filter(k => userAnswers.value[k]).length)
const formatTime = computed(() => {
  const mins = Math.floor(remainingTime.value / 60)
  const secs = remainingTime.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

function startExam() {
  const allQuestions = getAllData()
  questions.value = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, config.value.count)
  currentIndex.value = 0
  userAnswers.value = {}
  remainingTime.value = config.value.time * 60
  started.value = true
  finished.value = false
  
  timer.value = setInterval(() => {
    if (remainingTime.value <= 0) {
      submitExam()
    } else {
      remainingTime.value--
    }
  }, 1000)
}

function selectOption(index) {
  const letter = String.fromCharCode(65 + index)
  const q = currentQuestion.value
  let answer = userAnswers.value[q.id] || ''
  
  if (q.type === '多选题') {
    if (answer.includes(letter)) {
      answer = answer.replace(letter, '')
    } else {
      answer = (answer + letter).split('').sort().join('')
    }
  } else {
    answer = letter
  }
  
  userAnswers.value = { ...userAnswers.value, [q.id]: answer }
}

function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}

function confirmSubmit() {
  if (confirm('确定要交卷吗？')) {
    submitExam()
  }
}

function submitExam() {
  clearInterval(timer.value)
  
  let correct = 0, wrong = 0, unanswered = 0
  
  questions.value.forEach(q => {
    const userAnswer = userAnswers.value[q.id]
    if (!userAnswer) {
      unanswered++
    } else {
      const isCorrect = q.type === '多选题'
        ? userAnswer.split('').sort().join('') === q.answer.split('').sort().join('')
        : userAnswer === q.answer
      if (isCorrect) correct++
      else wrong++
    }
  })
  
  const score = Math.round((correct / questions.value.length) * 100)
  
  result.value = { score, correct, wrong, unanswered }
  addHistory({ type: '模拟考试', correct, accuracy: score })
  finished.value = true
}

function restartExam() {
  started.value = false
  finished.value = false
}

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.exam-page {
  padding-top: 20px;
}

.setup-card {
  margin-bottom: 20px;
}

.setup-item {
  margin-bottom: 16px;
}

.setup-item label {
  display: block;
  font-weight: 500;
  margin-bottom: 12px;
}

.option-group {
  display: flex;
  gap: 8px;
}

.option-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  font-size: 14px;
  cursor: pointer;
}

.option-btn.active {
  border-color: var(--primary-color);
  background: #e3f2fd;
  color: var(--primary-color);
}

.exam-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 16px;
}

.timer {
  font-size: 18px;
  font-weight: 600;
}

.timer.warning {
  color: var(--danger-color);
}

.answered {
  font-size: 14px;
  color: var(--text-secondary);
}

.submit-btn {
  padding: 8px 16px;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.nav-btns {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.nav-btns .btn {
  flex: 1;
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
  margin-bottom: 8px;
}

.result-score {
  font-size: 48px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.result-pass {
  font-size: 13px;
  color: var(--text-light);
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
  font-size: 28px;
  font-weight: bold;
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
