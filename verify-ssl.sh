#!/bin/bash

# SSL 配置验证脚本
# 用于验证 SSL 证书配置是否正确

set -e

echo "======================================"
echo "SSL 配置验证脚本"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOMAIN="hs-ai.top"
IP="115.190.184.251"

echo -e "${BLUE}测试域名: ${DOMAIN}${NC}"
echo -e "${BLUE}服务器IP: ${IP}${NC}"
echo ""

# 1. 检查证书文件
echo "1. 检查证书文件..."
if [ -f "nginx/ssl/hs-ai.top.pem" ] && [ -f "nginx/ssl/hs-ai.top.key" ]; then
    echo -e "${GREEN}✓ 证书文件存在${NC}"
    
    # 显示证书详情
    echo ""
    echo "证书详情:"
    openssl x509 -in nginx/ssl/hs-ai.top.pem -noout -subject -issuer -dates 2>/dev/null || echo -e "${YELLOW}⚠ 无法读取证书${NC}"
    
    # 检查证书有效期
    echo ""
    EXPIRY_DATE=$(openssl x509 -in nginx/ssl/hs-ai.top.pem -noout -enddate 2>/dev/null | cut -d= -f2)
    if [ -n "$EXPIRY_DATE" ]; then
        echo -e "证书过期时间: ${YELLOW}${EXPIRY_DATE}${NC}"
        
        # 计算剩余天数
        EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null || echo "0")
        CURRENT_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
        
        if [ $DAYS_LEFT -gt 30 ]; then
            echo -e "${GREEN}✓ 证书有效期充足 (剩余 ${DAYS_LEFT} 天)${NC}"
        elif [ $DAYS_LEFT -gt 0 ]; then
            echo -e "${YELLOW}⚠ 证书即将过期 (剩余 ${DAYS_LEFT} 天)${NC}"
        else
            echo -e "${RED}❌ 证书已过期${NC}"
        fi
    fi
    
    # 验证证书和私钥匹配
    echo ""
    echo "验证证书和私钥匹配..."
    CERT_MD5=$(openssl x509 -noout -modulus -in nginx/ssl/hs-ai.top.pem 2>/dev/null | openssl md5 | cut -d' ' -f2)
    KEY_MD5=$(openssl rsa -noout -modulus -in nginx/ssl/hs-ai.top.key 2>/dev/null | openssl md5 | cut -d' ' -f2)
    
    if [ "$CERT_MD5" = "$KEY_MD5" ]; then
        echo -e "${GREEN}✓ 证书和私钥匹配${NC}"
    else
        echo -e "${RED}❌ 证书和私钥不匹配${NC}"
    fi
else
    echo -e "${RED}❌ 证书文件不存在${NC}"
fi

echo ""
echo "======================================"

# 2. 检查端口
echo ""
echo "2. 检查端口监听..."

if command -v netstat &> /dev/null; then
    if netstat -tlnp 2>/dev/null | grep -q ":443"; then
        echo -e "${GREEN}✓ 端口 443 正在监听${NC}"
        netstat -tlnp 2>/dev/null | grep ":443" || true
    else
        echo -e "${YELLOW}⚠ 端口 443 未监听${NC}"
    fi
    
    if netstat -tlnp 2>/dev/null | grep -q ":80"; then
        echo -e "${GREEN}✓ 端口 80 正在监听${NC}"
    else
        echo -e "${YELLOW}⚠ 端口 80 未监听${NC}"
    fi
elif command -v ss &> /dev/null; then
    if ss -tlnp 2>/dev/null | grep -q ":443"; then
        echo -e "${GREEN}✓ 端口 443 正在监听${NC}"
        ss -tlnp 2>/dev/null | grep ":443" || true
    else
        echo -e "${YELLOW}⚠ 端口 443 未监听${NC}"
    fi
    
    if ss -tlnp 2>/dev/null | grep -q ":80"; then
        echo -e "${GREEN}✓ 端口 80 正在监听${NC}"
    else
        echo -e "${YELLOW}⚠ 端口 80 未监听${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 无法检查端口（netstat/ss 不可用）${NC}"
fi

echo ""
echo "======================================"

# 3. 测试 HTTP 重定向
echo ""
echo "3. 测试 HTTP 到 HTTPS 重定向..."

# 测试域名
echo ""
echo "测试: http://${DOMAIN}"
HTTP_RESPONSE=$(curl -s -I -L --max-time 5 "http://${DOMAIN}" 2>/dev/null || echo "FAILED")

if echo "$HTTP_RESPONSE" | grep -q "301\|302"; then
    REDIRECT_URL=$(echo "$HTTP_RESPONSE" | grep -i "location:" | head -1 | cut -d' ' -f2 | tr -d '\r')
    if echo "$REDIRECT_URL" | grep -q "https://"; then
        echo -e "${GREEN}✓ HTTP 正确重定向到 HTTPS${NC}"
        echo -e "  重定向到: ${REDIRECT_URL}"
    else
        echo -e "${YELLOW}⚠ HTTP 重定向但不是到 HTTPS${NC}"
        echo -e "  重定向到: ${REDIRECT_URL}"
    fi
elif echo "$HTTP_RESPONSE" | grep -q "FAILED"; then
    echo -e "${RED}❌ 无法连接到服务器${NC}"
else
    echo -e "${YELLOW}⚠ 未检测到重定向${NC}"
fi

echo ""
echo "======================================"

# 4. 测试 HTTPS 访问
echo ""
echo "4. 测试 HTTPS 访问..."

echo ""
echo "测试: https://${DOMAIN}"
HTTPS_RESPONSE=$(curl -s -I --max-time 5 "https://${DOMAIN}" 2>/dev/null || echo "FAILED")

if echo "$HTTPS_RESPONSE" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ HTTPS 访问成功${NC}"
    echo "$HTTPS_RESPONSE" | head -5
else
    echo -e "${RED}❌ HTTPS 访问失败${NC}"
    if echo "$HTTPS_RESPONSE" | grep -q "FAILED"; then
        echo "可能的原因："
        echo "  - 服务器未启动"
        echo "  - 防火墙阻止了 443 端口"
        echo "  - SSL 证书配置错误"
    fi
fi

echo ""
echo "======================================"

# 5. 测试 SSL 证书
echo ""
echo "5. 测试 SSL 证书..."

echo ""
echo "使用 openssl 测试 SSL 连接..."
SSL_TEST=$(timeout 5 openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} </dev/null 2>&1 || echo "FAILED")

if echo "$SSL_TEST" | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✓ SSL 证书验证成功${NC}"
elif echo "$SSL_TEST" | grep -q "CONNECTED"; then
    echo -e "${YELLOW}⚠ SSL 连接成功但证书验证可能有问题${NC}"
    echo "$SSL_TEST" | grep "Verify return code"
else
    echo -e "${RED}❌ SSL 连接失败${NC}"
fi

# 显示证书信息
if echo "$SSL_TEST" | grep -q "subject="; then
    echo ""
    echo "证书主体:"
    echo "$SSL_TEST" | grep "subject=" | head -1
    echo ""
    echo "证书颁发者:"
    echo "$SSL_TEST" | grep "issuer=" | head -1
fi

echo ""
echo "======================================"

# 6. 检查 Docker 容器状态（如果使用 Docker）
echo ""
echo "6. 检查服务状态..."

if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
    echo ""
    echo "Docker 容器状态:"
    docker compose ps 2>/dev/null || echo "未使用 Docker Compose"
    
    echo ""
    echo "Nginx 容器日志（最后 10 行）:"
    docker compose logs --tail=10 nginx 2>/dev/null || echo "无法获取日志"
elif command -v systemctl &> /dev/null; then
    echo ""
    echo "Nginx 服务状态:"
    systemctl status nginx --no-pager 2>/dev/null || echo "Nginx 服务未运行"
else
    echo -e "${YELLOW}⚠ 无法检查服务状态${NC}"
fi

echo ""
echo "======================================"
echo ""
echo -e "${BLUE}验证完成！${NC}"
echo ""
echo "建议的下一步操作："
echo "1. 在浏览器中访问: https://${DOMAIN}"
echo "2. 检查浏览器地址栏是否显示安全锁图标"
echo "3. 使用在线工具测试 SSL 配置:"
echo "   https://www.ssllabs.com/ssltest/analyze.html?d=${DOMAIN}"
echo ""
