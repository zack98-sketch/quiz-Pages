-- Cloudflare D1 数据库 Schema
-- 用于存储用户进度、收藏、历史记录（替代 localStorage）

-- 用户进度表
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,          -- 用户标识（可基于 session 或 设备 ID）
  totalAnswered INTEGER DEFAULT 0,
  correctCount INTEGER DEFAULT 0,
  wrongQuestions TEXT DEFAULT '[]', -- JSON 数组
  chapterProgress TEXT DEFAULT '{}', -- JSON 对象
  typeProgress TEXT DEFAULT '{}',   -- JSON 对象
  updated_at INTEGER NOT NULL
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, question_id)
);

-- 练习历史表
CREATE TABLE IF NOT EXISTS user_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,              -- 练习类型
  correct INTEGER DEFAULT 0,
  accuracy REAL NOT NULL,
  timestamp INTEGER NOT NULL
);

-- AI 配置表（加密存储）
CREATE TABLE IF NOT EXISTS ai_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  provider TEXT DEFAULT 'qwen',
  api_key_encrypted TEXT NOT NULL, -- 加密后的 API Key
  base_url TEXT NOT NULL,
  model TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_user_progress ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history ON user_history(user_id);
