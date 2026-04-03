import { quizData } from '../data/quizData.js'
import { escapeHtml, sanitizeQuestions } from './security.js'

// ⚠️  安全警告：在生产环境，确保 quizData 已经过清理
// 如果数据来自不可信源，请务必在构建时或运行时调用 sanitizeQuizData()

/**
 * 清理题库数据（一次性调用，建议在应用启动时执行）
 * 防止 XSS 攻击
 */
let _sanitized = false
export function sanitizeQuizData() {
  if (_sanitized) return quizData

  // 检查是否已经清理过（简单检查第一个题目）
  if (quizData.length > 0 && quizData[0].question.includes('&')) {
    console.warn('⚠️  题库数据可能未清理，执行 XSS 防护清理...')
    const sanitized = sanitizeQuestions(quizData)
    _sanitized = true
    return sanitized
  }

  _sanitized = true
  return quizData
}

// 题型映射
const TYPE_MAP = {
  '单选题': 1,
  '多选题': 2,
  '判断题': 3
}

// 获取所有数据（已清理）
let _cachedData = null
export function getAllData() {
  if (_cachedData === null) {
    _cachedData = sanitizeQuizData()
  }
  return _cachedData
}

// 获取章节列表
export function getChapters() {
  const data = getAllData()
  const chapters = [...new Set(data.map(q => q.chapter))]
  return chapters.map((name, index) => ({
    id: index + 1,
    name,
    count: data.filter(q => q.chapter === name).length
  }))
}

// 获取题型列表
export function getTypes() {
  const data = getAllData()
  return [
    { id: 1, name: '单选题', count: data.filter(q => q.typeId === 1).length },
    { id: 2, name: '多选题', count: data.filter(q => q.typeId === 2).length },
    { id: 3, name: '判断题', count: data.filter(q => q.typeId === 3).length }
  ]
}

// 随机获取
export function getRandom(count = 10) {
  const data = getAllData()
  const shuffled = [...data].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 按章节获取
export function getByChapter(chapterId) {
  const data = getAllData()
  return data.filter(q => q.chapterId === chapterId)
}

// 按题型获取
export function getByType(typeId) {
  const data = getAllData()
  return data.filter(q => q.typeId === typeId)
}

// 搜索（优化版 - 使用关键词索引）
let _searchIndex = null
function buildSearchIndex() {
  const data = getAllData()
  const index = new Map()

  data.forEach(q => {
    // 提取关键词（标题、选项、解析）
    const keywords = [
      q.question,
      ...q.options,
      q.analysis || ''
    ]
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 1) // 只索引长度>1的词

    keywords.forEach(word => {
      if (!index.has(word)) {
        index.set(word, new Set())
      }
      index.get(word).add(q.id)
    })
  })

  return index
}

export function searchQuestions(keyword) {
  const data = getAllData()
  const lower = keyword.toLowerCase().trim()

  if (!lower) return []

  // 优先使用索引（如果已构建）
  if (!_searchIndex) {
    _searchIndex = buildSearchIndex()
  }

  // 尝试精确匹配
  if (_searchIndex.has(lower)) {
    const ids = _searchIndex.get(lower)
    return data.filter(q => ids.has(q.id))
  }

  // 降级到全量匹配（支持模糊搜索）
  return data.filter(q => 
    q.question.toLowerCase().includes(lower) ||
    q.options.some(opt => opt.toLowerCase().includes(lower)) ||
    (q.analysis && q.analysis.toLowerCase().includes(lower))
  )
}

// 收藏功能
export function getFavorites() {
  const favIds = JSON.parse(localStorage.getItem('favorites') || '[]')
  const data = getAllData()
  return data.filter(q => favIds.includes(q.id))
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

// 进度功能（添加数据验证）
const DEFAULT_PROGRESS = {
  totalAnswered: 0,
  correctCount: 0,
  wrongQuestions: [],
  chapterProgress: {},
  typeProgress: {}
}

export function updateProgress(id, isCorrect, chapterId, typeId) {
  const raw = localStorage.getItem('progress')
  let progress = raw ? JSON.parse(raw) : { ...DEFAULT_PROGRESS }

  // 验证输入
  if (typeof id !== 'number' || typeof isCorrect !== 'boolean') {
    console.error('Invalid progress update', { id, isCorrect })
    return progress
  }

  progress.totalAnswered = (progress.totalAnswered || 0) + 1
  if (isCorrect) {
    progress.correctCount = (progress.correctCount || 0) + 1
  } else {
    if (!progress.wrongQuestions.includes(id)) {
      progress.wrongQuestions.push(id)
    }
  }

  // 章节进度
  if (!progress.chapterProgress[chapterId]) {
    progress.chapterProgress[chapterId] = { answered: 0, correct: 0 }
  }
  progress.chapterProgress[chapterId].answered++
  if (isCorrect) {
    progress.chapterProgress[chapterId].correct = (progress.chapterProgress[chapterId].correct || 0) + 1
  }

  // 题型进度
  if (!progress.typeProgress[typeId]) {
    progress.typeProgress[typeId] = { answered: 0, correct: 0 }
  }
  progress.typeProgress[typeId].answered++
  if (isCorrect) {
    progress.typeProgress[typeId].correct = (progress.typeProgress[typeId].correct || 0) + 1
  }

  localStorage.setItem('progress', JSON.stringify(progress))
  return progress
}

export function getProgress() {
  const raw = localStorage.getItem('progress')
  if (!raw) return { ...DEFAULT_PROGRESS }
  
  try {
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PROGRESS, ...parsed }
  } catch (e) {
    console.error('Failed to parse progress', e)
    return { ...DEFAULT_PROGRESS }
  }
}

// 历史记录（限制数量）
const MAX_HISTORY = 100

export function addHistory(record) {
  const history = JSON.parse(localStorage.getItem('history') || '[]')
  history.unshift({ ...record, timestamp: Date.now() })
  localStorage.setItem('history', JSON.stringify(history.slice(0, MAX_HISTORY)))
}

export function getHistory() {
  const raw = localStorage.getItem('history')
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse history', e)
    return []
  }
}
