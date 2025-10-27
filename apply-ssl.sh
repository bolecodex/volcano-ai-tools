#!/bin/bash

# SSL 配置应用脚本
# 用于应用 SSL 证书配置并重启 nginx

set -e

echo "======================================"
echo "SSL 配置应用脚本"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查证书文件是否存在
echo "1. 检查 SSL 证书文件..."
if [ ! -f "nginx/ssl/hs-ai.top.pem" ]; then
    echo -e "${RED}❌ 错误: 证书文件不存在: nginx/ssl/hs-ai.top.pem${NC}"
    exit 1
fi

if [ ! -f "nginx/ssl/hs-ai.top.key" ]; then
    echo -e "${RED}❌ 错误: 私钥文件不存在: nginx/ssl/hs-ai.top.key${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 证书文件检查通过${NC}"
echo ""

# 显示证书信息
echo "2. 证书信息:"
openssl x509 -in nginx/ssl/hs-ai.top.pem -noout -subject -dates 2>/dev/null || echo -e "${YELLOW}⚠ 无法读取证书信息${NC}"
echo ""

# 检查 Docker 是否运行
echo "3. 检查 Docker 环境..."
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓ Docker 正在运行${NC}"
        DOCKER_AVAILABLE=true
    else
        echo -e "${YELLOW}⚠ Docker 未运行${NC}"
        DOCKER_AVAILABLE=false
    fi
else
    echo -e "${YELLOW}⚠ Docker 未安装${NC}"
    DOCKER_AVAILABLE=false
fi
echo ""

# 应用配置
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "4. 使用 Docker Compose 应用配置..."
    
    # 检查容器是否运行
    if docker compose ps | grep -q "volcano-nginx"; then
        echo "检测到 nginx 容器正在运行"
        
        # 测试配置
        echo "测试 nginx 配置..."
        if docker compose exec -T nginx nginx -t; then
            echo -e "${GREEN}✓ Nginx 配置语法正确${NC}"
            
            # 重启 nginx
            echo "重启 nginx 容器..."
            docker compose restart nginx
            
            echo -e "${GREEN}✓ Nginx 已重启${NC}"
        else
            echo -e "${RED}❌ Nginx 配置语法错误，请检查配置文件${NC}"
            exit 1
        fi
    else
        echo "nginx 容器未运行，启动所有服务..."
        docker compose up -d
        echo -e "${GREEN}✓ 服务已启动${NC}"
    fi
    
    echo ""
    echo "5. 检查服务状态..."
    docker compose ps
    
else
    echo "4. 检查系统 Nginx..."
    
    if command -v nginx &> /dev/null; then
        echo "检测到系统 nginx"
        
        # 测试配置
        echo "测试 nginx 配置..."
        if sudo nginx -t; then
            echo -e "${GREEN}✓ Nginx 配置语法正确${NC}"
            
            # 重启 nginx
            echo "重启 nginx 服务..."
            if sudo systemctl restart nginx; then
                echo -e "${GREEN}✓ Nginx 已重启${NC}"
            else
                echo -e "${RED}❌ Nginx 重启失败${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ Nginx 配置语法错误，请检查配置文件${NC}"
            exit 1
        fi
        
        echo ""
        echo "5. 检查 Nginx 状态..."
        sudo systemctl status nginx --no-pager
    else
        echo -e "${RED}❌ 未找到 nginx（Docker 或系统）${NC}"
        echo "请先安装 Docker 或 Nginx"
        exit 1
    fi
fi

echo ""
echo "======================================"
echo -e "${GREEN}✓ SSL 配置已成功应用！${NC}"
echo "======================================"
echo ""
echo "测试建议："
echo "1. HTTP 重定向测试:"
echo "   curl -I http://hs-ai.top"
echo ""
echo "2. HTTPS 访问测试:"
echo "   curl -I https://hs-ai.top"
echo ""
echo "3. 浏览器访问:"
echo "   https://hs-ai.top"
echo ""
echo "4. 查看日志:"
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "   docker compose logs -f nginx"
else
    echo "   sudo tail -f /var/log/nginx/error.log"
fi
echo ""
