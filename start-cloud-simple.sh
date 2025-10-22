#!/bin/bash

# 简化的云服务器启动脚本（兼容Python 3.8）

echo "🚀 启动火山AI工具 (云服务器简化版)..."

# 检查Python版本
echo "🐍 检查Python版本..."
python3 --version

# 启动后端
echo "🔧 启动后端服务..."
cd backend

# 清理可能损坏的虚拟环境
if [ -d "venv" ]; then
    echo "🧹 清理旧的虚拟环境..."
    rm -rf venv
fi

# 创建新的虚拟环境
echo "📦 创建Python虚拟环境..."
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 升级pip
echo "⬆️  升级pip..."
python -m pip install --upgrade pip

# 安装依赖（使用系统pip避免OpenSSL问题）
echo "📦 安装Python依赖..."
python -m pip install --no-cache-dir -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Python依赖安装失败，尝试使用系统pip..."
    # 如果虚拟环境pip失败，尝试使用系统pip
    deactivate
    pip3 install --user -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Python依赖安装失败"
        exit 1
    fi
    # 重新激活虚拟环境
    source venv/bin/activate
fi

# 启动后端服务
echo "🚀 启动后端服务..."
python main.py &
BACKEND_PID=$!

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 8

# 检查后端是否启动成功
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ 后端启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ 后端启动成功！"

# 启动前端
echo "🌐 启动前端服务..."
cd ../frontend

# 检查端口3000是否被占用
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  端口3000被占用，正在释放..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 检查Node.js版本
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "📦 当前Node.js版本: v$(node --version | cut -d'v' -f2)"

# 安装Node.js依赖
echo "📦 安装Node.js依赖..."
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "⚠️  Node.js版本过低，使用兼容模式..."
    npm install --legacy-peer-deps
else
    npm install
fi

if [ $? -ne 0 ]; then
    echo "❌ Node.js依赖安装失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端服务
echo "🚀 启动前端服务..."
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "⚠️  使用兼容模式启动前端..."
    npx webpack serve --mode development --port 3000 &
else
    npm start &
fi
FRONTEND_PID=$!

# 等待前端启动
echo "⏳ 等待前端启动..."
sleep 10

echo "✅ 服务启动完成！"
echo "🌐 前端访问地址: http://localhost:3000"
echo "🔧 后端API地址: http://localhost:8000"
echo "📊 健康检查: http://localhost:8000/health"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
trap "echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
