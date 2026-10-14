#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# pnpm 在检测到 node_modules 需重建时会弹交互式确认（Y/n）。
# 平台构建环境无 TTY，确认提示会卡死直至超时失败 —— 强制非交互，失败即报错并在日志中可见。
export CI=true

cd "$PROJECT_DIR"
pnpm install --frozen-lockfile

cd "$PROJECT_DIR/web"
pnpm install --frozen-lockfile
pnpm run build