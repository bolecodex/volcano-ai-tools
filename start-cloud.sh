#!/bin/bash

# 火山AI工具云服务器启动脚本

echo "🚀 启动火山AI工具 (云服务器版)..."

# 检查系统环境
echo "🔍 检查系统环境..."
if [ -f /etc/debian_version ]; then
    OS="debian"
    echo "📋 检测到Debian/Ubuntu系统"
elif [ -f /etc/redhat-release ]; then
    OS="redhat"
    echo "📋 检测到RedHat/CentOS系统"
else
    OS="unknown"
    echo "⚠️  未知系统类型"
fi

# 安装必要的系统依赖
echo "📦 安装系统依赖..."
if [ "$OS" = "debian" ]; then
    apt update
    apt install -y python3 python3-pip python3-venv python3-dev build-essential curl wget
    apt install -y nodejs npm
elif [ "$OS" = "redhat" ]; then
    yum update -y
    yum install -y python3 python3-pip python3-devel gcc gcc-c++ make curl wget
    yum install -y nodejs npm
fi

# 检查Python版本
echo "🐍 检查Python版本..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python3未安装或不可用"
    exit 1
fi

# 检查Node.js版本
echo "📦 检查Node.js版本..."
node --version
if [ $? -ne 0 ]; then
    echo "❌ Node.js未安装或不可用"
    exit 1
fi

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
python3 -m venv venv --without-pip

# 激活虚拟环境并安装pip
source venv/bin/activate
echo "📦 安装pip..."
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
rm get-pip.py

# 升级pip
echo "⬆️  升级pip..."
python -m pip install --upgrade pip

# 安装依赖
echo "📦 安装Python依赖..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Python依赖安装失败"
    exit 1
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

# 安装Node.js依赖
echo "📦 安装Node.js依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Node.js依赖安装失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端服务
echo "🚀 启动前端服务..."
npm start &
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
