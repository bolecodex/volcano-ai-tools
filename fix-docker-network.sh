#!/bin/bash

echo "🔧 Docker网络问题诊断和修复工具"

# 检查Docker状态
echo "📋 检查Docker状态..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker Desktop"
    exit 1
fi

# 检查网络连接
echo "🌐 检查网络连接..."
if ! ping -c 1 registry-1.docker.io > /dev/null 2>&1; then
    echo "⚠️  无法连接到Docker Hub，尝试使用镜像源..."
    
    # 配置Docker镜像源
    echo "🔧 配置Docker镜像源..."
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://dockerproxy.com"
  ],
  "dns": ["8.8.8.8", "114.114.114.114", "223.5.5.5"]
}
EOF
    
    echo "🔄 重启Docker服务..."
    sudo systemctl restart docker 2>/dev/null || {
        echo "⚠️  无法重启Docker服务，请手动重启Docker Desktop"
        echo "然后运行: docker system prune -f"
    }
    
    sleep 5
fi

# 测试镜像拉取
echo "🧪 测试镜像拉取..."
if docker pull hello-world > /dev/null 2>&1; then
    echo "✅ Docker网络连接正常"
    docker rmi hello-world > /dev/null 2>&1
else
    echo "❌ Docker网络仍有问题，建议使用本地模式"
    echo "💡 解决方案："
    echo "   1. 检查网络连接"
    echo "   2. 配置代理设置"
    echo "   3. 使用本地模式启动: ./start-local.sh"
    exit 1
fi

echo "🎉 Docker网络修复完成！"
