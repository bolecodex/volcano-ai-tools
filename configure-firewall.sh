#!/bin/bash

# 云服务器防火墙配置脚本

echo "🔧 配置云服务器防火墙..."

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

# 配置防火墙
echo "🔥 配置防火墙规则..."

if [ "$OS" = "debian" ]; then
    # Ubuntu/Debian使用ufw
    echo "📦 安装ufw防火墙..."
    apt update
    apt install -y ufw
    
    echo "🔧 配置ufw规则..."
    # 允许SSH
    ufw allow 22/tcp
    # 允许HTTP
    ufw allow 80/tcp
    # 允许HTTPS
    ufw allow 443/tcp
    # 允许前端端口
    ufw allow 3000/tcp
    # 允许后端端口
    ufw allow 8000/tcp
    
    # 启用防火墙
    ufw --force enable
    
elif [ "$OS" = "redhat" ]; then
    # CentOS/RHEL使用firewalld
    echo "📦 安装firewalld防火墙..."
    yum install -y firewalld
    
    echo "🔧 配置firewalld规则..."
    # 启动firewalld
    systemctl start firewalld
    systemctl enable firewalld
    
    # 添加端口
    firewall-cmd --permanent --add-port=22/tcp
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --permanent --add-port=3000/tcp
    firewall-cmd --permanent --add-port=8000/tcp
    
    # 重载配置
    firewall-cmd --reload
fi

# 检查端口监听状态
echo "📊 检查端口监听状态..."
netstat -tlnp | grep -E ":(80|443|3000|8000|22) "

# 检查防火墙状态
echo "🔥 检查防火墙状态..."
if [ "$OS" = "debian" ]; then
    ufw status
elif [ "$OS" = "redhat" ]; then
    firewall-cmd --list-all
fi

echo "✅ 防火墙配置完成！"
echo "🌐 现在可以通过以下地址访问："
echo "   前端: http://115.190.184.251:3000"
echo "   后端: http://115.190.184.251:8000"
echo "   健康检查: http://115.190.184.251:8000/health"
