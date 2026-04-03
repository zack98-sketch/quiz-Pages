# 🚀 Cloudflare Pages 部署配置

## 前置要求

1. [Cloudflare 账号](https://dash.cloudflare.com)
2. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/)
3. 已安装 Node.js 18+

---

## 📦 部署步骤

### 步骤 1：登录 Cloudflare

```bash
wrangler login
```

### 步骤 2：创建 KV 命名空间（存储 AI 配置）

```bash
# 创建命名空间
wrangler kv:namespace create "AI_CONFIG"

# 输出示例：
# ⛳️  Success! Created kv namespace with id "xxx"
# ⛳️  Success! Added binding for namespace AI_CONFIG to wrangler.toml
```

记录输出的 `id`，更新 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "AI_CONFIG"
id = "你的-KV-命名空间-ID"
```

### 步骤 3：创建 D1 数据库（存储用户数据）

```bash
# 创建数据库
wrangler d1 create "quiz-db"

# 输出：
# database_name = "quiz-db"
# database_id = "你的-D1-数据库-ID"
```

更新 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "quiz-db"
database_id = "你的-D1-数据库-ID"
```

### 步骤 4：应用数据库 Schema

```bash
wrangler d1 execute quiz-db --file schema.sql
```

### 步骤 5：设置 AI 配置（通过 KV）

```bash
# 写入配置（示例：通义千问）
wrangler kv:key put --binding=AI_CONFIG ai-config '{
  "provider": "qwen",
  "apiKey": "你的-API-KEY",
  "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "model": "qwen-plus"
}'
```

### 步骤 6：部署到 Cloudflare Pages

```bash
# 构建项目
npm run build

# 方式 A：使用 Pages 自动部署（推荐）
# 1. 推送代码到 GitHub
git add .
git commit -m "feat: add Cloudflare deployment config"
git push origin security-fixes

# 2. 在 Cloudflare Dashboard → Pages → 创建项目
#    - 连接 GitHub 仓库
#    - 构建设置：
#      * 构建命令：npm run build
#      * 输出目录：dist
#      * 环境变量：NODE_VERSION=18
#    - 高级配置 → Functions 目录：worker.js（启用 Functions）

# 方式 B：使用 Wrangler 直接部署（需要 Pages 项目已创建）
wrangler pages deploy dist --project-name=quiz-pages
```

---

## 🔐 安全说明

### 1. API Key 存储

**❌ 不要在前端硬编码 API Key**

**✅ 正确做法：**
- 开发环境：使用 `localStorage`（临时）
- 生产环境：通过 Cloudflare Worker 代理，Key 存储于 KV（绝不暴露给客户端）

### 2. 用户数据隔离

- LocalStorage → D1 数据库（多设备同步）
- 用户 ID 通过 Session 或设备指纹生成

### 3. XSS 防护

- 题库数据在构建时清理（`dataSanitizer.js`）
- Vue 模板自动转义（Vue 默认开启）
- CSP 头限制脚本来源

### 4. 速率限制

Worker 已内置限流（Cloudflare 自动），如需自定义可在 `worker.js` 添加：

```javascript
// 限制每个 IP 60 次/分钟
if (request.headers.get('cf-ipcountry') && rateLimitExceeded(ip)) {
  return new Response('Too Many Requests', { status: 429 })
}
```

---

## 🛠️ 环境变量清单

在 Cloudflare Pages 设置中添加：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NODE_VERSION` | Node 版本 | `18` |
| `VITE_ENV` | 环境标识 | `production` |

**KV 变量（通过 Wrangler 绑定，无需在此处设置）：**
- `AI_CONFIG` → AI 配置（API Key、模型等）

---

## 📊 数据库迁移

首次部署后，运行迁移脚本初始化表结构：

```bash
# 方式 1：通过 wrangler CLI
wrangler d1 execute quiz-db --file schema.sql

# 方式 2：通过 Worker 路由（创建 /api/migrate 端点）
curl -X POST https://your-site.pages.dev/api/migrate
```

---

## 🔍 监控与日志

1. **Cloudflare Analytics** — 查看流量、错误率
2. **Workers Logs** — `wrangler tail`
3. **D1 Dashboard** — 查询统计

---

## ⚡ 性能优化

- ✅ **静态资源缓存**：Pages 自动添加 `Cache-Control`
- ✅ **边缘计算**：Worker 全球低延迟
- ✅ **KV 读取**：毫秒级 Key-Value 存储
- ✅ **D1 查询**：SQLite 兼容，索引加速

---

## 🐛 故障排查

| 问题 | 解决方案 |
|------|---------|
| Worker 未触发 | 检查 `functions` 目录是否存在 `worker.js` |
| KV 绑定失败 | 确认 `wrangler.toml` 中的 `id` 正确 |
| D1 连接失败 | 检查数据库名和 ID，确保已创建 |
| 构建失败 | 查看 Cloudflare Pages 构建日志 |
| API 401 | 检查 KV 中 `ai-config` 的 API Key 是否正确 |

---

## 📞 支持

- Cloudflare 文档：https://developers.cloudflare.com/pages/
- Worker 文档：https://developers.cloudflare.com/workers/
- D1 文档：https://developers.cloudflare.com/d1/

---

**祝部署顺利！🚀**
