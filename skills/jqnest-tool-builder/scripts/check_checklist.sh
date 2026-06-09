#!/usr/bin/env bash
# check_checklist.sh — 综合检查清单：骨架 + Token + JS 规范 + 注册
# 用法: ./check_checklist.sh <slug>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TOOLS_DIR="$PROJECT_ROOT/tools"
TOOLS_JS="$PROJECT_ROOT/public/scripts/data/tools.js"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

pass() { echo -e "${GREEN}  ✅ $1${NC}"; ((++PASS)); return 0; }
fail() { echo -e "${RED}  ❌ $1${NC}"; ((++FAIL)); return 0; }
warn() { echo -e "${YELLOW}  ⚠️  $1${NC}"; ((++WARN)); return 0; }

if [[ $# -lt 1 ]]; then
  echo "用法: $0 <slug>"
  exit 1
fi

SLUG="$1"
HTML="$TOOLS_DIR/$SLUG/index.html"
JS="$TOOLS_DIR/$SLUG/page.js"

echo "🔍 综合检查: $SLUG"
echo "=========================================="

# --- 1. 文件存在性 ---
echo ""
echo "📂 文件存在性"
[[ -f "$HTML" ]] && pass "index.html 存在" || fail "index.html 不存在"
[[ -f "$JS" ]]   && pass "page.js 存在"    || fail "page.js 不存在"

# 无文件则提前退出
if [[ ! -f "$HTML" || ! -f "$JS" ]]; then
  echo ""
  echo -e "${RED}核心文件缺失，终止检查${NC}"
  exit 1
fi

# --- 2. HTML 骨架 ---
echo ""
echo "🏗️ HTML 骨架"
grep -q 'data-page="tool"' "$HTML"           && pass "data-page=\"tool\"" || fail "缺少 data-page=\"tool\""
grep -q 'data-base-path='  "$HTML"            && pass "data-base-path"    || fail "缺少 data-base-path"
grep -q "data-tool-slug=\"$SLUG\"" "$HTML"    && pass "data-tool-slug 匹配 slug" || fail "data-tool-slug 不匹配 ($SLUG)"
grep -q 'data-tool-header' "$HTML"            && pass "data-tool-header"  || fail "缺少 data-tool-header"
grep -q 'app-init.js'      "$HTML"            && pass "引入 app-init.js"  || fail "未引入 app-init.js"
grep -q 'page.js'          "$HTML"            && pass "引入 page.js"      || fail "未引入 page.js"
grep -q 'type="module"'    "$HTML"            && pass "script type=module" || warn "建议使用 type=\"module\""

# --- 3. CSS 引入 ---
echo ""
echo "🎨 CSS 引入"
grep -q 'tokens.css'     "$HTML" && pass "tokens.css"     || fail "未引入 tokens.css"
grep -q 'themes.css'     "$HTML" && pass "themes.css"     || warn "未引入 themes.css"
grep -q 'base.css'       "$HTML" && pass "base.css"       || fail "未引入 base.css"
grep -q 'layout.css'     "$HTML" && pass "layout.css"     || fail "未引入 layout.css"
grep -q 'components.css' "$HTML" && pass "components.css" || fail "未引入 components.css"
grep -q 'utilities.css'  "$HTML" && pass "utilities.css"  || warn "未引入 utilities.css"

# --- 4. JS 规范 ---
echo ""
echo "📜 page.js 规范"
grep -q 'mountToolHeader' "$JS" && pass "调用 mountToolHeader" || fail "未调用 mountToolHeader"

# data-* 选择器（禁止 getElementById / .querySelector('#')）
if grep -qE 'getElementById|querySelector\s*\(\s*['\''"]#' "$JS"; then
  fail "JS 中使用了 id 选择器（应用 data-* 属性）"
else
  pass "未使用 id 选择器"
fi

# 禁止 alert()
if grep -qE '\balert\s*\(' "$JS"; then
  fail "JS 中使用了 alert()（应用 showToast）"
else
  pass "未使用 alert()"
fi

# 禁止 document.execCommand('copy')
if grep -q 'execCommand' "$JS"; then
  fail "JS 中使用了 execCommand（应用 copyText）"
else
  pass "未使用 execCommand"
fi

# 推荐导入 dom.js
grep -q "dom.js" "$JS" && pass "导入 dom.js 工具" || warn "未导入 dom.js 工具"

# 禁止 document.querySelector（应用 $ from dom.js）
if grep -qE '\bdocument\.querySelector\b' "$JS"; then
  warn "JS 中直接用了 document.querySelector（推荐用 \$ from dom.js）"
else
  pass "未直接使用 document.querySelector"
fi

# --- 5. tool.css 行数检查 ---
# 规范：≤100 行无需注释；101-200 行需文件头部说明原因；>200 行需评估是否提取到 _shared/
echo ""
echo "📏 tool.css 行数"
CSS="$TOOLS_DIR/$SLUG/tool.css"
if [[ -f "$CSS" ]]; then
  css_lines=$(wc -l < "$CSS" | tr -d ' ')
  has_reason=$(grep -cE '(工具特有|独立.*布局|拖拽|交互层|tool-specific|reason)' "$CSS" 2>/dev/null || true)
  if [[ "$css_lines" -le 100 ]]; then
    pass "tool.css $css_lines 行（≤ 100，无需注释）"
  elif [[ "$css_lines" -le 200 ]]; then
    if [[ "$has_reason" -gt 0 ]]; then
      pass "tool.css $css_lines 行（101-200，有说明注释 ✓）"
    else
      warn "tool.css $css_lines 行（> 100），请在文件头部注释说明工具特有 UI 的原因"
    fi
  else
    if [[ "$has_reason" -gt 0 ]]; then
      warn "tool.css $css_lines 行（> 200），已有说明注释，但建议评估是否提取为 _shared/*.css"
    else
      fail "tool.css $css_lines 行（> 200），须在文件头部注释说明原因，并评估是否提取为 _shared/*.css"
    fi
  fi
else
  pass "无 tool.css（最优）"
fi

# --- 6. 硬编码 Token 扫描（简化版） ---
echo ""
echo "🎯 硬编码 Token"

# 硬编码颜色（排除注释和 CSS 变量定义）
color_hits=$(grep -cE '#[0-9a-fA-F]{3,8}' "$HTML" 2>/dev/null || true)
if [[ "$color_hits" -gt 0 ]]; then
  warn "index.html 中有 $color_hits 处疑似硬编码颜色"
else
  pass "index.html 无硬编码颜色"
fi

color_hits_js=$(grep -cE '#[0-9a-fA-F]{3,8}' "$JS" 2>/dev/null || true)
if [[ "$color_hits_js" -gt 0 ]]; then
  warn "page.js 中有 $color_hits_js 处疑似硬编码颜色"
else
  pass "page.js 无硬编码颜色"
fi

# --- 7. 工具注册 ---
echo ""
echo "📋 工具注册"
if grep -q "\"$SLUG\"\\|'$SLUG'" "$TOOLS_JS" 2>/dev/null; then
  pass "已在 tools.js 注册"
else
  fail "未在 tools.js 注册"
fi

# --- 8. 图标 ---
echo ""
echo "🖼️ 图标"
if grep -qE 'data-lucide=' "$HTML"; then
  pass "使用 Lucide 图标"
else
  warn "未发现 Lucide 图标引用（可能不需要）"
fi

if grep -qE '<svg|emoji' "$HTML"; then
  warn "发现内联 SVG 或 emoji（应用 Lucide data-lucide）"
else
  pass "未使用内联 SVG/emoji"
fi

# --- 9. 数据来源脚注 ---
echo ""
echo "📎 数据来源脚注"

# 仅有 vendor 脚本 → 通用库在关于页集中致谢，不强制工具页脚注
footer_line=$(grep -E '<p class="field-hint u-muted' "$HTML" | grep 'text-align:center' | head -1 || true)
if [[ -n "$footer_line" ]]; then
  if echo "$footer_line" | grep -qE 'text-align:\s*center'; then
    pass "脚注含 text-align:center"
  else
    fail "数据来源脚注须居中：style=\"margin:0;text-align:center\"（见 components.md §数据来源脚注）"
  fi
  if echo "$footer_line" | grep -qE 'u-m[tbxy]-'; then
    fail "脚注禁止用 u-mt-* / u-mb-* 等 margin 工具类"
  else
    pass "脚注未滥用 margin 工具类"
  fi
  if echo "$footer_line" | grep -qE '[0-9]+\s*KB|[0-9]+\s*MB|本地静态加载'; then
    fail "脚注禁止写文件体积或「本地静态加载」"
  else
    pass "脚注未写体积/加载细节"
  fi
else
  pass "无工具页脚注（通用 vendor 见关于页开源组件）"
fi

# --- 汇总 ---
echo ""
echo "=========================================="
echo "通过: $PASS  失败: $FAIL  警告: $WARN"
echo ""
if [[ $FAIL -gt 0 ]]; then
  echo -e "${RED}❌ 有 $FAIL 项不合格，请修复后重新检查${NC}"
  exit 1
elif [[ $WARN -gt 0 ]]; then
  echo -e "${YELLOW}⚠️  全部通过，但有 $WARN 项建议改进${NC}"
else
  echo -e "${GREEN}✅ 全部通过！${NC}"
fi
