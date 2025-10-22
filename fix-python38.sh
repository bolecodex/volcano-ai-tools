#!/bin/bash

# Python 3.8 环境修复脚本

echo "🔧 修复Python 3.8环境..."

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

# 安装Python 3.9
echo "🐍 安装Python 3.9..."
if [ "$OS" = "debian" ]; then
    # 添加deadsnakes PPA
    apt install -y software-properties-common
    add-apt-repository -y ppa:deadsnakes/ppa
    apt update
    apt install -y python3.9 python3.9-venv python3.9-dev python3.9-distutils
    apt install -y python3.9-pip
elif [ "$OS" = "redhat" ]; then
    # 安装EPEL和SCL
    yum install -y epel-release
    yum install -y centos-release-scl
    yum install -y rh-python39 rh-python39-python-devel rh-python39-python-pip
    # 启用Python 3.9
    scl enable rh-python39 bash
fi

# 设置Python 3.9为默认版本
echo "🔧 设置Python 3.9为默认版本..."
if [ "$OS" = "debian" ]; then
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1
    update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1
elif [ "$OS" = "redhat" ]; then
    echo 'source scl_source enable rh-python39' >> ~/.bashrc
fi

# 安装其他必要依赖
echo "📦 安装其他依赖..."
if [ "$OS" = "debian" ]; then
    apt install -y build-essential libssl-dev libffi-dev
    apt install -y nodejs npm
elif [ "$OS" = "redhat" ]; then
    yum install -y gcc gcc-c++ make openssl-devel libffi-devel
    yum install -y nodejs npm
fi

# 升级pip
echo "⬆️  升级pip..."
python3 -m pip install --upgrade pip

# 安装虚拟环境工具
echo "📦 安装虚拟环境工具..."
python3 -m pip install virtualenv

echo "✅ Python 3.8环境修复完成！"
echo "🚀 现在可以运行: ./start-cloud.sh"
