#!/bin/bash

# 云服务器环境修复脚本

echo "🔧 修复云服务器Python环境..."

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

# 更新系统包
echo "📦 更新系统包..."
if [ "$OS" = "debian" ]; then
    apt update
    apt upgrade -y
elif [ "$OS" = "redhat" ]; then
    yum update -y
fi

# 安装Python相关包
echo "🐍 安装Python环境..."
if [ "$OS" = "debian" ]; then
    apt install -y python3 python3-pip python3-venv python3-dev python3-setuptools
    apt install -y build-essential libssl-dev libffi-dev
    apt install -y nodejs npm
elif [ "$OS" = "redhat" ]; then
    yum install -y python3 python3-pip python3-devel python3-setuptools
    yum install -y gcc gcc-c++ make openssl-devel libffi-devel
    yum install -y nodejs npm
fi

# 修复pip问题
echo "🔧 修复pip环境..."
if [ "$OS" = "debian" ]; then
    # 卸载有问题的包
    apt remove -y python3-openssl python3-cryptography
    apt install -y python3-openssl python3-cryptography --reinstall
elif [ "$OS" = "redhat" ]; then
    yum remove -y python3-cryptography
    yum install -y python3-cryptography
fi

# 升级pip
echo "⬆️  升级pip..."
python3 -m pip install --upgrade pip

# 安装虚拟环境工具
echo "📦 安装虚拟环境工具..."
python3 -m pip install virtualenv

echo "✅ 环境修复完成！"
echo "🚀 现在可以运行: ./start-cloud.sh"
