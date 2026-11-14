# Wiki 知识库

一套可自托管的团队 wiki 与知识库系统。面向内部文档沉淀：写、组织、检索、协作、问答都在同一个站点内完成，
数据完全存放在自己的服务器上。

- **纯源码交付**：Docker 只承载数据库、缓存与转换服务，应用本体由源码构建，方便二次开发
- **开箱即用**：一条 `docker compose` 命令完成构建与启动，无需在服务器上安装 Node.js
- **功能完整**：实时协作、AI 语义检索与问答、权限体系、模板、导入导出等均已内置

---

## 功能特性

**内容与编辑**

- 富文本编辑器，支持标题、表格、代码块、任务列表、引用、附件
- 实时多人协作编辑（基于 CRDT，离线改动联网后自动合并）
- 页面树与空间（Space）划分，支持拖拽排序、移动、复制
- 页面历史版本，可查看差异并回滚
- 评论与提及
- 绘图与图表：Draw.io、Excalidraw、Mermaid
- 嵌入外部内容：Airtable、Loom、Miro、Figma 等

**检索与 AI**

- 全文搜索（BM25）+ 向量语义检索双通道，中文短句也能命中
- AI 问答：基于库内文档回答并给出引用来源，不会凭空编造
- 页面保存后自动切块、向量化入库，无需手动触发索引
- 模型接口兼容 OpenAI 协议，可接任意云厂商或本地推理服务

**组织与治理**

- 空间级、页面级权限，支持只读 / 可编辑 / 可管理
- 用户组批量授权
- 页面模板，统一文档格式
- 审计日志、API Key、两步验证（TOTP）
- 导入导出：Markdown、HTML、DOCX、PDF
- 多语言界面

---

## 技术栈

| 层 | 选型 |
|---|---|
| 后端 | NestJS + Fastify，TypeScript，Kysely |
| 前端 | React + Vite，TypeScript |
| 协作 | Yjs / CRDT，WebSocket 长连接 |
| 数据库 | PostgreSQL 18 + pgvector（向量检索） |
| 缓存与队列 | Redis 8 + BullMQ |
| 文档转换 | Gotenberg（DOCX / PDF 导出） |
| 包管理 | pnpm workspace |

---

## 快速开始（服务器部署）

前置条件：Docker 24+ 与 Docker Compose v2。

```bash
git clone <本仓库地址> wiki
cd wiki

# 只需改两处：对外访问地址、会话密钥
vi .env.server

docker compose -f docker-compose.deploy.yml up -d --build
```

首次构建约 5–10 分钟（安装依赖 + 编译前后端）。启动后访问 `APP_URL`，第一个注册的账号即为管理员。

验证：

```bash
docker compose -f docker-compose.deploy.yml ps
curl -s http://127.0.0.1:3000/api/health
```

更详细的部署、数据迁移、故障排查见 [DEPLOY.md](./DEPLOY.md)。

---

## 本地开发

```bash
# 1. 只起依赖（PostgreSQL / Redis / Gotenberg）
docker compose -f docker-compose.deps.yml up -d

# 2. 安装依赖
pnpm install

# 3. 构建并启动
pnpm build
pnpm start          # 默认 http://localhost:3000
```

Windows 下可直接双击项目根目录的启停脚本：`start-*.cmd` 启动、`stop-*.cmd` 停止应用、
`stop-all-*.cmd` 连同容器一起停。

常用脚本：

| 命令 | 作用 |
|---|---|
| `pnpm build` | 构建前后端并同步内置增强模块 |
| `pnpm start` | 以生产模式启动（需先 build） |
| `pnpm dev` | 前后端热更新模式 |
| `pnpm server:build` | 仅构建后端 |
| `pnpm ee:sync` | 重新同步内置增强模块 |

---

## 目录结构

```
apps/
  server/        后端服务（API、协作、任务队列）
  client/        前端应用
packages/        共享包（编辑器扩展、表单等）
vendor/          内置增强模块的编译产物（构建时同步进 dist）
scripts/         构建辅助脚本
keys/            许可证签发与验签密钥
data/            本地附件目录（容器部署时使用数据卷）
```

---

## 配置说明

所有运行参数集中在 `.env.server`（容器部署）或 `.env`（本地开发），关键项：

| 变量 | 用途 |
|---|---|
| `APP_URL` | 对外访问地址，影响登录跳转与邮件链接 |
| `APP_SECRET` | 会话加密密钥，泄漏等同可伪造登录态 |
| `DATABASE_URL` | PostgreSQL 连接串（容器内主机名为 `db`） |
| `REDIS_URL` | Redis 连接串（容器内主机名为 `redis`） |
| `AI_DRIVER` | AI 驱动，`openai-compatible` 表示走标准协议 |
| `OPENAI_API_URL` / `OPENAI_API_KEY` | 模型服务地址与密钥 |
| `AI_CHAT_MODEL` / `AI_EMBEDDING_MODEL` | 对话模型与向量模型 |
| `GOTENBERG_URL` | 文档转换服务地址 |

更换 AI 服务只需改这三个变量：`OPENAI_API_URL`、`OPENAI_API_KEY`、`AI_CHAT_MODEL`，重启应用即可。

---

## 运维

```bash
docker compose -f docker-compose.deploy.yml ps            # 状态
docker compose -f docker-compose.deploy.yml logs -f       # 日志
docker compose -f docker-compose.deploy.yml restart       # 重启
docker compose -f docker-compose.deploy.yml down          # 停止（保留数据）
```

需要备份的只有两个数据卷：数据库卷与附件卷。升级时 `git pull` 后重新
`up -d --build` 即可，数据库迁移在启动时自动执行。

---

## 许可

本系统基于开源项目二次开发，核心部分遵循 AGPL-3.0；增强模块已内置并默认启用，
授权文件位于 `keys/` 与 `license-enterprise.txt`。
