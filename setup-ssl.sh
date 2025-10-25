#!/bin/bash

# SSL 证书配置脚本
# 用于为 www.hs-ai.top 配置 Let's Encrypt SSL 证书

set -e

echo "======================================"
echo "SSL 证书配置脚本"
echo "域名: www.hs-ai.top"
echo "======================================"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 检查 nginx 是否运行
if ! systemctl is-active --quiet nginx; then
    echo "错误: nginx 未运行，正在启动..."
    systemctl start nginx
fi

# 检查域名是否已解析到本服务器
echo "正在检查域名解析..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short www.hs-ai.top | tail -n1)

echo "服务器 IP: $SERVER_IP"
echo "域名解析 IP: $DOMAIN_IP"

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo ""
    echo "警告: 域名 www.hs-ai.top 尚未正确解析到本服务器"
    echo "请先在域名服务商处添加 A 记录："
    echo "  主机记录: www"
    echo "  记录类型: A"
    echo "  记录值: $SERVER_IP"
    echo ""
    read -p "是否继续？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 请求 SSL 证书
echo ""
echo "正在请求 SSL 证书..."
echo "请输入您的邮箱地址（用于接收证书过期提醒）："
read -p "邮箱: " EMAIL

if [ -z "$EMAIL" ]; then
    echo "错误: 邮箱地址不能为空"
    exit 1
fi

# 使用 certbot 获取证书
certbot --nginx -d www.hs-ai.top -d hs-ai.top \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --redirect

# 测试 nginx 配置
nginx -t

# 重启 nginx
systemctl restart nginx

echo ""
echo "======================================"
echo "SSL 证书配置完成！"
echo "======================================"
echo ""
echo "您的网站现在可以通过以下地址访问："
echo "  https://www.hs-ai.top"
echo "  https://hs-ai.top"
echo ""
echo "证书将在 90 天后过期，certbot 会自动续期"
echo "可以使用以下命令测试自动续期："
echo "  sudo certbot renew --dry-run"
echo ""
