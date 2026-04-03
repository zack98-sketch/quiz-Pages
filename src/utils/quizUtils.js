import { quizData } from '../data/quizData.js'

// 题型映射
const TYPE_MAP = {
  '单选题': 1,
  '多选题': 2,
  '判断题': 3
}

// 获取所有数据
export function getAllData() {
  return quizData
}

// 获取章节列表
export function getChapters() {
  const chapters = [...new Set(quizData.map(q => q.chapter))]
  return chapters.map((name, index) => ({
    id: index + 1,
    name,
    count: quizData.filter(q => q.chapter === name).length
  }))
}

// 获取题型列表
export function getTypes() {
  return [
    { id: 1, name: '单选题', count: quizData.filter(q => q.typeId === 1).length },
    { id: 2, name: '多选题', count: quizData.filter(q => q.typeId === 2).length },
    { id: 3, name: '判断题', count: quizData.filter(q => q.typeId === 3).length }
  ]
}

// 随机获取
export function getRandom(count = 10) {
  const shuffled = [...quizData].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 按章节获取
export function getByChapter(chapterId) {
  return quizData.filter(q => q.chapterId === chapterId)
}

// 按题型获取
export function getByType(typeId) {
  return quizData.filter(q => q.typeId === typeId)
}

// 搜索
export function searchQuestions(keyword) {
  const lower = keyword.toLowerCase()
  return quizData.filter(q => 
    q.question.toLowerCase().includes(lower) ||
    q.options.some(opt => opt.toLowerCase().includes(lower)) ||
    (q.analysis && q.analysis.toLowerCase().includes(lower))
  )
}

// 收藏功能
export function getFavorites() {
  const favIds = JSON.parse(localStorage.getItem('favorites') || '[]')
  return quizData.filter(q => favIds.includes(q.id))
}

export function addFavorite(id) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  if (!favs.includes(id)) {
    favs.push(id)
    localStorage.setItem('favorites', JSON.stringify(favs))
  }
}

export function removeFavorite(id) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  favs = favs.filter(fid => fid !== id)
  localStorage.setItem('favorites', JSON.stringify(favs))
}

export function isFavorite(id) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
  return favs.includes(id)
}

// 进度功能
export function updateProgress(id, isCorrect, chapterId, typeId) {
  const progress = JSON.parse(localStorage.getItem('progress') || '{"totalAnswered":0,"correctCount":0,"wrongQuestions":[],"chapterProgress":{},"typeProgress":{}}')
  
  progress.totalAnswered++
  if (isCorrect) {
    progress.correctCount++
  } else {
    if (!progress.wrongQuestions.includes(id)) {
      progress.wrongQuestions.push(id)
    }
  }

  if (!progress.chapterProgress[chapterId]) {
    progress.chapterProgress[chapterId] = { answered: 0, correct: 0 }
  }
  progress.chapterProgress[chapterId].answered++
  if (isCorrect) progress.chapterProgress[chapterId].correct++

  if (!progress.typeProgress[typeId]) {
    progress.typeProgress[typeId] = { answered: 0, correct: 0 }
  }
  progress.typeProgress[typeId].answered++
  if (isCorrect) progress.typeProgress[typeId].correct++

  localStorage.setItem('progress', JSON.stringify(progress))
  return progress
}

export function getProgress() {
  return JSON.parse(localStorage.getItem('progress') || '{"totalAnswered":0,"correctCount":0,"wrongQuestions":[],"chapterProgress":{},"typeProgress":{}}')
}

// 历史记录
export function addHistory(record) {
  const history = JSON.parse(localStorage.getItem('history') || '[]')
  history.unshift({ ...record, timestamp: Date.now() })
  localStorage.setItem('history', JSON.stringify(history.slice(0, 100)))
}

export function getHistory() {
  return JSON.parse(localStorage.getItem('history') || '[]')
}
