#!/bin/bash
cd "$(dirname "$0")"
PORT=5173
echo ""
echo "  jqnest 工具箱已启动 ✦"
echo "  打开浏览器访问: http://127.0.0.1:$PORT"
echo "  关闭此窗口即可停止服务"
echo ""
open "http://127.0.0.1:$PORT"
python3 -m http.server $PORT
