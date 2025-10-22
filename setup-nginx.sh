#!/bin/bash

# Nginx安装和配置脚本

echo "🔧 安装和配置Nginx..."

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

# 安装Nginx
echo "📦 安装Nginx..."
if [ "$OS" = "debian" ]; then
    apt update
    apt install -y nginx
elif [ "$OS" = "redhat" ]; then
    yum install -y nginx
fi

# 备份原配置
echo "💾 备份原Nginx配置..."
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# 复制新配置
echo "🔧 配置Nginx..."
cp nginx/nginx-production.conf /etc/nginx/nginx.conf

# 测试配置
echo "🧪 测试Nginx配置..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx配置测试通过"
    
    # 启动Nginx
    echo "🚀 启动Nginx..."
    systemctl start nginx
    systemctl enable nginx
    
    # 检查状态
    echo "📊 检查Nginx状态..."
    systemctl status nginx --no-pager
    
    echo "✅ Nginx配置完成！"
    echo "🌐 现在可以通过以下地址访问："
    echo "   应用: http://115.190.184.251"
    echo "   API: http://115.190.184.251/api/"
    echo "   健康检查: http://115.190.184.251/health"
    
else
    echo "❌ Nginx配置测试失败"
    echo "🔄 恢复原配置..."
    cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
    exit 1
fi
