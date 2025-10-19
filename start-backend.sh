#!/bin/bash

# 启动后端服务的脚本

echo "正在启动后端服务..."
cd backend

# 检查虚拟环境是否存在
if [ ! -d "venv" ]; then
    echo "虚拟环境不存在，正在创建..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 检查依赖是否已安装
if ! pip show fastapi > /dev/null 2>&1; then
    echo "正在安装依赖..."
    pip install -r requirements.txt
fi

# 启动服务
echo "启动 FastAPI 服务..."
python main.py

