#!/usr/bin/env bash
# check_skeleton.sh — 校验工具 HTML 骨架是否符合规范
# 用法: ./check_skeleton.sh <slug>
# 或:   ./check_skeleton.sh --all   (扫描所有工具)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TOOLS_DIR="$PROJECT_ROOT/v2/tools"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0
CHECKED=0

check_file() {
  local slug="$1"
  local html="$TOOLS_DIR/$slug/index.html"

  if [[ ! -f "$html" ]]; then
    echo -e "${RED}❌ $slug: index.html 不存在${NC}"
    ((ERRORS++))
    return
  fi

  ((CHECKED++))
  local issues=0

  # 1. data-page="tool"
  if ! grep -q 'data-page="tool"' "$html"; then
    echo -e "${RED}  ❌ $slug: 缺少 data-page=\"tool\"${NC}"
    ((issues++))
  fi

  # 2. data-base-path
  if ! grep -q 'data-base-path=' "$html"; then
    echo -e "${RED}  ❌ $slug: 缺少 data-base-path${NC}"
    ((issues++))
  fi

  # 3. data-tool-slug
  if ! grep -q 'data-tool-slug=' "$html"; then
    echo -e "${RED}  ❌ $slug: 缺少 data-tool-slug${NC}"
    ((issues++))
  fi

  # 4. data-tool-header
  if ! grep -q 'data-tool-header' "$html"; then
    echo -e "${RED}  ❌ $slug: 缺少 data-tool-header${NC}"
    ((issues++))
  fi

  # 5. app-init.js 引入
  if ! grep -q 'app-init.js' "$html"; then
    echo -e "${RED}  ❌ $slug: 未引入 app-init.js${NC}"
    ((issues++))
  fi

  # 6. page.js 引入
  if ! grep -q 'page.js' "$html"; then
    echo -e "${RED}  ❌ $slug: 未引入 page.js${NC}"
    ((issues++))
  fi

  # 7. CSS 引入顺序检查（至少 tokens.css + base.css + components.css）
  if ! grep -q 'tokens.css' "$html"; then
    echo -e "${YELLOW}  ⚠️  $slug: 未引入 tokens.css${NC}"
    ((WARNINGS++))
  fi

  if ! grep -q 'base.css' "$html"; then
    echo -e "${YELLOW}  ⚠️  $slug: 未引入 base.css${NC}"
    ((WARNINGS++))
  fi

  # 8. page.js 文件存在
  if [[ ! -f "$TOOLS_DIR/$slug/page.js" ]]; then
    echo -e "${RED}  ❌ $slug: page.js 不存在${NC}"
    ((issues++))
  fi

  if [[ $issues -eq 0 ]]; then
    echo -e "${GREEN}  ✅ $slug: 骨架正常${NC}"
  else
    ((ERRORS += issues))
  fi
}

# ---------- 主逻辑 ----------
if [[ $# -lt 1 ]]; then
  echo "用法: $0 <slug> | --all"
  exit 1
fi

if [[ "$1" == "--all" ]]; then
  echo "🔍 扫描所有工具骨架…"
  echo ""
  for dir in "$TOOLS_DIR"/*/; do
    slug=$(basename "$dir")
    # 跳过 _shared 目录
    [[ "$slug" == _* ]] && continue
    check_file "$slug"
  done
else
  check_file "$1"
fi

echo ""
echo "=========================================="
echo "已检查: $CHECKED  错误: $ERRORS  警告: $WARNINGS"
if [[ $ERRORS -gt 0 ]]; then
  echo -e "${RED}有 $ERRORS 个错误需要修复${NC}"
  exit 1
else
  echo -e "${GREEN}全部通过 ✅${NC}"
fi
