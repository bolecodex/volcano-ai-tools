#!/bin/bash

echo "======================================"
echo "修复并重新启动应用"
echo "======================================"

# 1. 首先查找并终止占用端口的进程
echo ""
echo "步骤 1: 检查端口占用情况..."
PORT_3000=$(lsof -ti:3000)
PORT_8000=$(lsof -ti:8000)

if [ ! -z "$PORT_3000" ]; then
    echo "端口 3000 被进程 $PORT_3000 占用，正在终止..."
    kill -9 $PORT_3000 2>/dev/null
    sleep 1
fi

if [ ! -z "$PORT_8000" ]; then
    echo "端口 8000 被进程 $PORT_8000 占用，正在终止..."
    kill -9 $PORT_8000 2>/dev/null
    sleep 1
fi

# 2. 安装后端缺失的依赖
echo ""
echo "步骤 2: 安装后端依赖 (greenlet)..."
cd backend
source venv/bin/activate
pip install greenlet==3.0.1
if [ $? -ne 0 ]; then
    echo "错误: greenlet 安装失败"
    exit 1
fi

# 3. 启动后端服务（后台运行）
echo ""
echo "步骤 3: 启动后端服务..."
nohup python main.py > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "后端服务已启动 (PID: $BACKEND_PID)"
echo "日志文件: backend.log"

# 等待后端启动
sleep 3

# 检查后端是否成功启动
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ 后端服务运行中"
    # 测试后端 API
    sleep 2
    if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        echo "✅ 后端 API 可访问: http://localhost:8000"
    else
        echo "⚠️  后端可能还在启动中，请稍等..."
    fi
else
    echo "❌ 后端启动失败，请查看 backend.log"
    exit 1
fi

# 4. 启动前端服务（后台运行）
echo ""
echo "步骤 4: 启动前端服务..."
cd ../frontend
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务已启动 (PID: $FRONTEND_PID)"
echo "日志文件: frontend.log"

echo ""
echo "======================================"
echo "✅ 应用启动完成！"
echo "======================================"
echo ""
echo "访问地址:"
echo "  - 前端: http://localhost:3000"
echo "  - 后端 API 文档: http://localhost:8000/docs"
echo ""
echo "查看日志:"
echo "  - 后端日志: tail -f backend.log"
echo "  - 前端日志: tail -f frontend.log"
echo ""
echo "停止服务:"
echo "  - 后端: kill $BACKEND_PID"
echo "  - 前端: kill $FRONTEND_PID"
echo ""
echo "进程 ID 已保存:"
echo "$BACKEND_PID" > backend.pid
echo "$FRONTEND_PID" > frontend.pid
echo ""

