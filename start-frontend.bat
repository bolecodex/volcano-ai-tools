@echo off
REM Windows 启动前端Web应用脚本

echo 正在启动前端Web应用...
cd frontend

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 依赖未安装，正在安装...
    npm install
)

REM 启动开发服务器
echo 启动开发服务器...
echo 应用将在 http://localhost:3000 打开
npm start

pause

