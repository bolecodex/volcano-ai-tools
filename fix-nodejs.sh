#!/bin/bash

# Node.js版本升级脚本

echo "🔧 升级Node.js版本..."

# 检测系统类型
if [ -f /etc/debian_version ]; then
    OS="debian"
    echo "📋 检测到Debian/Ubuntu系统"
elif [ -f /etc/redhat-release ]; then
    OS="redhat"
    echo "📋 检测到RedHat/CentOS系统"
else
    echo "❌ 不支持的系统类型"
    exit 1
fi

# 检查当前Node.js版本
echo "📦 当前Node.js版本:"
node --version

# 安装NodeSource仓库
echo "📦 安装NodeSource仓库..."
if [ "$OS" = "debian" ]; then
    # 卸载旧版本
    apt remove -y nodejs npm
    
    # 安装Node.js 18 LTS
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
elif [ "$OS" = "redhat" ]; then
    # 卸载旧版本
    yum remove -y nodejs npm
    
    # 安装Node.js 18 LTS
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
fi

# 验证安装
echo "✅ 验证Node.js安装..."
node --version
npm --version

# 清理npm缓存
echo "🧹 清理npm缓存..."
npm cache clean --force

echo "✅ Node.js升级完成！"
echo "🚀 现在可以运行: ./start-cloud-simple.sh"
