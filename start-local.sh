#!/bin/bash

# 火山AI工具本地启动脚本

echo "🚀 启动火山AI工具..."


# 本地启动模式
echo "💻 使用本地模式启动..."

# 启动后端
echo "🔧 启动后端服务..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
echo "📦 安装Python依赖..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Python依赖安装失败"
    exit 1
fi

echo "🚀 启动后端服务..."
python main.py &
BACKEND_PID=$!

# 等待后端启动
echo "⏳ 等待后端启动..."
sleep 5

# 检查后端是否启动成功
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ 后端启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端
echo "🌐 启动前端服务..."
cd ../frontend

# 检查端口3000是否被占用
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  端口3000被占用，正在释放..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "📦 安装Node.js依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Node.js依赖安装失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "🚀 启动前端服务..."
npm start &
FRONTEND_PID=$!

# 等待前端启动
echo "⏳ 等待前端启动..."
sleep 8

echo "✅ 服务启动完成！"
echo "🌐 前端访问地址: http://localhost:3000"
echo "🔧 后端API地址: http://localhost:8000"
echo "📊 健康检查: http://localhost:8000/health"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
trap "echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
