#!/bin/bash

echo "🔧 构建本地Docker镜像..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker Desktop"
    exit 1
fi

# 构建后端镜像
echo "📦 构建后端镜像..."
cd backend
docker build -t volcano-backend:local .
if [ $? -ne 0 ]; then
    echo "❌ 后端镜像构建失败"
    exit 1
fi
cd ..

# 构建前端镜像
echo "📦 构建前端镜像..."
cd frontend
docker build -t volcano-frontend:local .
if [ $? -ne 0 ]; then
    echo "❌ 前端镜像构建失败"
    exit 1
fi
cd ..

echo "✅ 镜像构建完成！"
echo "🚀 使用以下命令启动服务："
echo "   docker-compose -f docker-compose.offline.yml up -d"
