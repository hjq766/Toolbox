#!/usr/bin/env bash
# check_tokens.sh — 扫描工具代码中的硬编码颜色/字号/间距/圆角
# 用法: ./check_tokens.sh <slug>
# 或:   ./check_tokens.sh --all

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TOOLS_DIR="$PROJECT_ROOT/v2/tools"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

TOTAL_HITS=0
CHECKED=0

# 硬编码颜色模式（排除 CSS 变量定义和注释行）
COLOR_PATTERN='(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))'

# 硬编码尺寸模式（font-size / border-radius / padding / margin / gap 使用 px）
SIZE_PATTERN='(font-size|border-radius|padding|margin|gap)\s*:\s*[0-9]+px'

# 硬编码圆角快捷
RADIUS_PATTERN='border-radius\s*:\s*[0-9]'

scan_file() {
  local file="$1"
  local slug="$2"
  local relpath="${file#$TOOLS_DIR/}"
  local hits=0

  # 跳过 .min. 文件和 node_modules
  [[ "$file" == *.min.* ]] && return
  [[ "$file" == *node_modules* ]] && return

  # 硬编码颜色
  local color_hits
  color_hits=$(grep -nE "$COLOR_PATTERN" "$file" 2>/dev/null | grep -v '^\s*//' | grep -v '^\s*\*' | grep -v 'var(--' || true)
  if [[ -n "$color_hits" ]]; then
    echo -e "${YELLOW}  ⚠️  硬编码颜色 in $relpath:${NC}"
    echo "$color_hits" | head -5
    hits=$(echo "$color_hits" | wc -l | tr -d ' ')
  fi

  # 硬编码尺寸（仅 CSS/HTML 文件）
  if [[ "$file" == *.css || "$file" == *.html ]]; then
    local size_hits
    size_hits=$(grep -nE "$SIZE_PATTERN" "$file" 2>/dev/null | grep -v 'var(--' || true)
    if [[ -n "$size_hits" ]]; then
      echo -e "${YELLOW}  ⚠️  硬编码尺寸 in $relpath:${NC}"
      echo "$size_hits" | head -5
      local count
      count=$(echo "$size_hits" | wc -l | tr -d ' ')
      ((hits += count))
    fi
  fi

  # var(--radius) 没有 size 后缀
  local bad_radius
  bad_radius=$(grep -nE 'var\(--radius\)' "$file" 2>/dev/null || true)
  if [[ -n "$bad_radius" ]]; then
    echo -e "${RED}  ❌ var(--radius) 缺少 size 后缀 (-sm/-md/-lg/-xl) in $relpath:${NC}"
    echo "$bad_radius"
    local count
    count=$(echo "$bad_radius" | wc -l | tr -d ' ')
    ((hits += count))
  fi

  ((TOTAL_HITS += hits))
}

check_tool() {
  local slug="$1"
  local tool_dir="$TOOLS_DIR/$slug"

  if [[ ! -d "$tool_dir" ]]; then
    echo -e "${RED}❌ 工具不存在: $slug${NC}"
    return
  fi

  ((CHECKED++))
  echo "🔍 $slug"

  # 扫描 html, css, js 文件
  while IFS= read -r -d '' file; do
    scan_file "$file" "$slug"
  done < <(find "$tool_dir" -maxdepth 2 \( -name '*.html' -o -name '*.css' -o -name '*.js' \) -not -name '*.min.*' -print0)

  if [[ $TOTAL_HITS -eq 0 ]]; then
    echo -e "${GREEN}  ✅ 无硬编码 token 问题${NC}"
  fi
}

# ---------- 主逻辑 ----------
if [[ $# -lt 1 ]]; then
  echo "用法: $0 <slug> | --all"
  exit 1
fi

if [[ "$1" == "--all" ]]; then
  echo "🔍 扫描所有工具的硬编码 token…"
  echo ""
  for dir in "$TOOLS_DIR"/*/; do
    slug=$(basename "$dir")
    [[ "$slug" == _* ]] && continue
    TOOL_HITS=0
    check_tool "$slug"
    echo ""
  done
else
  check_tool "$1"
fi

echo ""
echo "=========================================="
echo "已检查: $CHECKED  命中: $TOTAL_HITS"
if [[ $TOTAL_HITS -gt 0 ]]; then
  echo -e "${YELLOW}发现 $TOTAL_HITS 处疑似硬编码，请手动确认并替换为 CSS token${NC}"
  exit 1
else
  echo -e "${GREEN}全部通过 ✅${NC}"
fi
