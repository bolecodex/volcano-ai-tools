#!/bin/bash

# 云服务器综合修复脚本

echo "🔧 云服务器综合修复脚本..."

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

# 1. 修复OpenSSL问题
echo "🔧 步骤1: 修复OpenSSL问题..."
if [ "$OS" = "debian" ]; then
    apt update
    apt remove -y python3-openssl python3-cryptography python3-pip
    apt autoremove -y
    apt install -y python3-openssl python3-cryptography python3-pip
    apt install -y python3-venv python3-dev python3-setuptools
    apt install -y build-essential libssl-dev libffi-dev
elif [ "$OS" = "redhat" ]; then
    yum remove -y python3-cryptography python3-pip
    yum install -y python3-cryptography python3-pip
    yum install -y python3-devel python3-setuptools
    yum install -y gcc gcc-c++ make openssl-devel libffi-devel
fi

# 2. 升级Node.js
echo "🔧 步骤2: 升级Node.js..."
if [ "$OS" = "debian" ]; then
    apt remove -y nodejs npm
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
elif [ "$OS" = "redhat" ]; then
    yum remove -y nodejs npm
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
fi

# 3. 升级pip
echo "🔧 步骤3: 升级pip..."
python3 -m pip install --upgrade pip

# 4. 安装虚拟环境工具
echo "🔧 步骤4: 安装虚拟环境工具..."
python3 -m pip install virtualenv

# 5. 清理npm缓存
echo "🔧 步骤5: 清理npm缓存..."
npm cache clean --force

# 6. 验证安装
echo "✅ 验证安装..."
echo "Python版本: $(python3 --version)"
echo "Node.js版本: $(node --version)"
echo "npm版本: $(npm --version)"

echo "✅ 综合修复完成！"
echo "🚀 现在可以运行: ./start-cloud-simple.sh"
