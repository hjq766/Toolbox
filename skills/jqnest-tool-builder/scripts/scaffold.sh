#!/usr/bin/env bash
# scaffold.sh — 快速创建新工具骨架
# 用法: ./scaffold.sh <slug> <type>
# 类型: base | converter-linear | converter-nonlinear | image-tool | code-editor | text-tool | generator

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(cd "$SKILL_DIR/../.." && pwd)"
TEMPLATES_DIR="$SKILL_DIR/assets/templates"
TOOLS_DIR="$PROJECT_ROOT/tools"

# ---------- 参数校验 ----------
if [[ $# -lt 2 ]]; then
  echo "用法: $0 <slug> <type>"
  echo ""
  echo "类型:"
  echo "  base                 基础空模板"
  echo "  converter-linear     线性单位换算"
  echo "  converter-nonlinear  非线性单位换算"
  echo "  image-tool           图片处理"
  echo "  code-editor          代码编辑器"
  echo "  text-tool            文本处理"
  echo "  generator            实时生成器"
  exit 1
fi

SLUG="$1"
TYPE="$2"
TPL_DIR="$TEMPLATES_DIR/$TYPE"
TARGET="$TOOLS_DIR/$SLUG"

if [[ ! -d "$TPL_DIR" ]]; then
  echo "❌ 未知模板类型: $TYPE"
  echo "   可选: base | converter-linear | converter-nonlinear | image-tool | code-editor | text-tool | generator"
  exit 1
fi

if [[ -d "$TARGET" ]]; then
  echo "❌ 目录已存在: $TARGET"
  echo "   如需重建请先手动删除"
  exit 1
fi

# ---------- 复制模板 ----------
mkdir -p "$TARGET"
cp "$TPL_DIR/index.html" "$TARGET/index.html"
cp "$TPL_DIR/page.js" "$TARGET/page.js"

# ---------- 替换 slug 占位符 ----------
if [[ "$(uname)" == "Darwin" ]]; then
  sed -i '' "s/TODO_SLUG/$SLUG/g" "$TARGET/index.html"
else
  sed -i "s/TODO_SLUG/$SLUG/g" "$TARGET/index.html"
fi

echo "✅ 已创建工具骨架: $TARGET"
echo "   index.html  ← 基于 $TYPE 模板"
echo "   page.js     ← 基于 $TYPE 模板"
echo ""
echo "⚠️  接下来你需要:"
echo "   1. 在 public/scripts/data/tools.js 注册新工具"
echo "   2. 修改 index.html 中的 <title> 和业务 UI"
echo "   3. 实现 page.js 中的 TODO 业务逻辑"
echo "   4. 测试三种访问方式:"
echo "      - http://localhost:5173/tools/$SLUG/index.html"
echo "      - http://localhost:5173/#/tool/$SLUG"
echo "      - 首页搜索"
