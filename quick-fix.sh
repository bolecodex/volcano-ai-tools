#!/bin/bash

echo "==================================="
echo "快速修复后端服务"
echo "==================================="

# 停止现有的后端服务
echo ""
echo "1. 停止现有后端服务..."
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "✅ 已停止端口 8000 上的服务" || echo "⚠️  端口 8000 上没有运行的服务"

# 等待端口释放
sleep 2

# 安装 greenlet
echo ""
echo "2. 安装 greenlet 依赖..."
cd backend
source venv/bin/activate
pip install -q greenlet==3.0.1
echo "✅ greenlet 安装完成"

# 启动后端
echo ""
echo "3. 启动后端服务..."
echo "==================================="
python main.py

