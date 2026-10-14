# DOO多智能体系统

基于DOO多智能体的大班幼儿叙事能力提升工具，用于5-6岁幼儿叙事能力的诊断评估与个性化支持。

## 核心概念

- **DOO**: 叙事能力的三个维度 —— 词句(Diction)、语言组织(Organization)、独白观点(Opinion)
- **多智能体**: D博士(专家)、小欧老师(助教)、多多(同伴) 三个AI角色协同工作
- **评估标准**: 基于《学前儿童语言学习量表》，7个子维度各分3级评分

## 快速开始

```bash
# 安装依赖（项目使用 pnpm，勿用 npm/yarn）
pnpm install

# 配置环境变量（密钥仅从环境变量读取，禁止硬编码/提交）
cp .env.example .env
# 编辑 .env 填入 LLM API 密钥

# 构建（根目录脚本：装依赖 + tsc + 前端构建 → web/dist）
bash scripts/build.sh

# 运行（根目录脚本：读 .preview 端口 fallback 5000，绑定 0.0.0.0）
bash scripts/run.sh
```

## 目录结构

```
src/               # 多智能体核心：消息总线、智能体、DOO 模型、NLP、画像、场景
web/               # 前端（React+Vite）+ 服务端（Express，tsx 运行）
web/src/           # React 前端源码（HashRouter 路由、页面、组件、hooks）
web/server/        # Express 服务端（所有 /api/* 路由，静态托管 web/dist）
web/scripts/       # build.sh / run.sh（根脚本）
```

## 应用场景

场景由**后端场景库动态配置**（admin 可增删/启停），内置默认场景：
入园晨检、区域活动、户外/体育游戏、生活活动（进餐/午睡）、智能故事角、叙事小火车、奇妙旅行 等。
前端测评页从 `/api/scenarios` 动态读取并支持选择，默认场景行为保持不变。

## 鉴权与部署

- **鉴权**：登录发放 HMAC token（默认 12h）+ bcrypt 密码哈希；班级/场景/用户管理等写操作需 `requireAdmin`，
  普通接口需 `requireAuth`（详见 `web/server/index.ts`）。密钥（`AUTH_SECRET` / `LLM_API_KEY` 等）仅从环境变量读取。
- **存储**：生产用 PostgreSQL（`DATABASE_URL`，平台注入 `PGDATABASE_URL`），无数据库时回落本地 JSON 文件。
- **部署形态**：单端口 HTTP 服务，前端静态资源 + `/api/*` 同源；SPA fallback 仅非 `/api` 路径返回 `index.html`，
  `/api/*` 未命中统一 404。部署规格：外网 80 → 内网 5000。

## 配置说明

支持通过环境变量配置（参见 `.env.example` 与根 `AGENTS.md` §6 完整清单）：

- `LLM_PROVIDER` / `LLM_API_KEY` / `LLM_MODEL` / `LLM_BASE_URL` — LLM 接入（默认 `coze` 平台托管；当前沙箱走 `openai` 协议 + DeepSeek）
- `DATABASE_URL` — PostgreSQL 连接串（生产必填）
- `AUTH_SECRET` / `AUTH_TOKEN_TTL_HOURS` / `ACCESS_CODE` — 鉴权与站点口令
- `RATE_LIMIT_PER_MIN` / `RATE_LIMIT_GLOBAL_PER_MIN` — 限流

## 技术栈

- **前端**: React 19 + TypeScript + Vite 8 + react-router（HashRouter）
- **服务端**: Node.js + TypeScript + Express（tsx 运行）
- **鉴权**: HMAC token + bcrypt
- **AI**: 平台托管 LLM（coze）/ OpenAI 兼容端点 / 规则引擎兜底；TTS/STT 平台托管
- **存储**: PostgreSQL（生产，JSON 文件为本地回落）
- **包管理**: pnpm
