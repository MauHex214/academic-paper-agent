#!/bin/bash

# Academic Paper Agent - Init Script
# 用于启动开发服务器

set -e

echo "🚀 启动学术论文写作助手..."

# 检查依赖
if ! command -v bun &> /dev/null; then
    echo "❌ Bun 未安装，请先安装: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# 安装依赖（如需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    bun install
fi

# 启动开发服务器
echo "🌐 启动服务器..."
echo "访问 http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

bun run dev
