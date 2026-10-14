# CLAUDE.md — web/ 前端与服务端说明

本文档为在 `web/` 子目录下工作（尤其是 AI 编程助手）提供准确指引，反映**当前线上实际**实现，替代早期过时的 localStorage 模拟鉴权 / localhost:3001 直连等描述。

## Project Overview

React + TypeScript + Vite 前端 + Express 服务端（tsx 直接运行 TS），同源部署在**单端口** HTTP 服务上：
`web/server/index.ts` 同时托管前端静态产物 `web/dist` 与 `/api/*` 接口。后端通过 `import { DOOMultiAgentSystem } from '../../src'` 复用父目录多智能体核心。

教师可：
- 用 DOO 模型（词句 Diction / 组织 Organization / 观点 Opinion）评估幼儿叙事能力
- 查看幼儿画像（雷达图、评估历史、报告导出）
- 查看班级聚合统计
- 管理班级与场景库（admin）

## Tech Stack

- **前端**：React 19 + TypeScript + Vite 8
- **路由**：react-router-dom v7 **HashRouter**（兼容静态托管，支持前进/后退、刷新停留、可分享链接）
- **服务端**：Express + tsx（运行时不依赖编译产物）
- **鉴权**：**HMAC token（12h）+ bcrypt + requireAdmin** 角色鉴权（非 localStorage 模拟）
- **存储**：PostgreSQL（生产，经 `DATABASE_URL`/`PGDATABASE_URL`）；本地回落 JSON 文件
- **样式**：全局 CSS 变量（`src/index.css` `:root`）+ 页面级 CSS（`web/src/styles/*.css`），无内联 `<style>`（报警/导出 HTML 模板除外）
- **字体**：ZCOOL KuaiLe 本地子集 `web/public/fonts/ZCOOLKuaiLe-subset.woff2` + 系统中文字体回退栈（不依赖 Google Fonts）

## Development & Build

构建与运行由**项目根脚本**统一驱动（勿在 web/ 内另起 vite dev server 作为交付）：

```bash
# 构建（根目录，pnpm）：装依赖 + tsc + vite build → web/dist
bash scripts/build.sh

# 运行（根目录）：读 .preview 端口 fallback 5000，绑定 0.0.0.0
bash scripts/run.sh
```

`tsc -b` 仅编译 `web/src`（strict，含 `noUnusedLocals`）；`web/server/*` 与父 `src/*` 由 tsx 运行时执行（类型错误不在此暴露，需通过接口实测验证）。

## Routing

`src/App.tsx` 用 `HashRouter`；路由表：
`/`（Dashboard）、`/assess`、`/portraits`、`/portrait/:childId`（PortraitPage 用 `useParams` 自动选中幼儿）、
`/class-stats`、`/profile`、`/admin-users`、`/admin-config`，`*` → `/`。

服务端 SPA fallback：`express.static` 托管 `web/dist`，仅非 `/api` 路径回落 `index.html`；`/api/*` 未命中统一 404。

## Pages & Components

页面（`src/pages/`）：`LoginPage`、`Dashboard`、`AssessPage`（班级/场景从接口动态拉取）、`PortraitPage`、
`ClassStatsPage`、`ProfilePage`、`AdminUsersPage`（教师管理）、`AdminConfigPage`（班级/场景库管理）。

组件（`src/components/`）：
- `Sidebar` — 桌面固定侧边栏 + `<900px` 顶部抽屉导航（`.mobile-topbar`）
- `RadarChart` — SVG 三轴雷达图
- `VoiceInput` / `VoiceOutput` — 语音采集（WebAudio 16kHz PCM→WAV）与 TTS 播放；上传前本地 15MB 预检
- `ReportExport` — 生成独立 HTML 报告（内嵌自包含 `<style>`，属导出文档）
- `PortraitList` / `PortraitDetail` / `HistoryTimeline` — PortraitPage 拆出的子组件
- `UserTable` / `AddUserModal` / `EditUserModal` — AdminUsersPage 拆出的子组件

## State & Data

- `AuthContext.tsx` — 登录/注册/管理员 CRUD；`API_BASE='/api'`（相对路径，同源）
- hooks `src/hooks/`：`usePortraits` / `useClasses` / `useScenarios` / `useStats` — 接口数据获取；
  按登录老师 `user.classId` 自动带 `?classId=` 过滤（老师只见本班），admin 见全部
- `src/services/api.ts` — `API_BASE='/api'`，请求带 `X-Auth-Token`

## API 要点

- 鉴权：`requireAuth`（读）、`requireAdmin`（写，如班级/场景/用户管理）
- `/api/classes`：班级 CRUD（GET 读 / POST/PUT/DELETE 需 admin）
- `/api/scenarios`：场景库 CRUD（含启停）；`/api/scenario/:type` 运行某场景
- `/api/portraits`、`/api/stats`：支持 `?classId=` 过滤
- `/api/stt`：上限 **15MB**（与平台单文件上限对齐），超限 413
- `/api/health`：探活，无鉴权

## Key Conventions

- UI 文案全中文（zh-CN）
- 样式用 CSS 变量 + `web/src/styles/*.css`；新的页面样式不新增内联 `<style>`
- 无 TypeScript 路径别名，相对导入
- `web/` 是独立 Vite 工程，但服务端 `web/server/index.ts` 复用父 `../../src` 多智能体核心
- **不要**用 `localhost:3001` 直连后端（同源部署，前端统一走相对 `/api`）