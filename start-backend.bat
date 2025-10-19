@echo off
REM Windows 启动后端服务脚本

echo 正在启动后端服务...
cd backend

REM 检查虚拟环境是否存在
if not exist "venv" (
    echo 虚拟环境不存在，正在创建...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate

REM 检查依赖是否已安装
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo 正在安装依赖...
    pip install -r requirements.txt
)

REM 启动服务
echo 启动 FastAPI 服务...
python main.py

pause

