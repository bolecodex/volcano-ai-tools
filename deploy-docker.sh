#!/bin/bash

# 火山AI工具 - Docker 快速部署脚本
# 使用方法: ./deploy-docker.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        log_info "安装命令: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        log_info "安装命令: sudo curl -L \"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
        exit 1
    fi
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    mkdir -p nginx/ssl
    mkdir -p logs
    mkdir -p data
}

# 生成SSL自签名证书（用于测试）
generate_ssl_cert() {
    if [ ! -f nginx/ssl/cert.pem ]; then
        log_info "生成SSL自签名证书..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
        log_success "SSL证书生成完成"
    else
        log_info "SSL证书已存在"
    fi
}

# 创建环境配置文件
create_env_file() {
    if [ ! -f .env ]; then
        log_info "创建环境配置文件..."
        cat > .env << EOF
# 生产环境配置
NODE_ENV=production

# 数据库配置
DATABASE_URL=sqlite+aiosqlite:///./data/hs_adk.db

# JWT配置
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 服务器配置
HOST=0.0.0.0
PORT=8000

# 日志配置
LOG_LEVEL=INFO
EOF
        log_success "环境配置文件创建完成"
    else
        log_info "环境配置文件已存在"
    fi
}

# 构建和启动服务
build_and_start() {
    log_info "构建和启动Docker服务..."
    
    # 停止现有服务
    docker-compose down 2>/dev/null || true
    
    # 构建并启动服务
    docker-compose up -d --build
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    log_info "检查服务状态..."
    docker-compose ps
}

# 检查服务健康状态
check_health() {
    log_info "检查服务健康状态..."
    
    # 检查后端健康状态
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log_success "后端服务健康"
    else
        log_warning "后端服务可能未正常启动"
    fi
    
    # 检查前端服务
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "前端服务健康"
    else
        log_warning "前端服务可能未正常启动"
    fi
}

# 显示访问信息
show_access_info() {
    log_success "部署完成！"
    echo
    log_info "=================================="
    log_info "访问信息:"
    log_info "  前端应用: http://localhost:3000"
    log_info "  后端API: http://localhost:8000"
    log_info "  API文档: http://localhost:8000/docs"
    log_info "  健康检查: http://localhost:8000/health"
    log_info "=================================="
    echo
    log_info "管理命令:"
    log_info "  查看服务状态: docker-compose ps"
    log_info "  查看日志: docker-compose logs -f"
    log_info "  重启服务: docker-compose restart"
    log_info "  停止服务: docker-compose down"
    log_info "  更新服务: docker-compose pull && docker-compose up -d"
    echo
}

# 主函数
main() {
    log_info "火山AI工具 - Docker 快速部署"
    log_info "=============================="
    
    # 检查Docker
    check_docker
    
    # 创建目录
    create_directories
    
    # 生成SSL证书
    generate_ssl_cert
    
    # 创建环境配置
    create_env_file
    
    # 构建和启动
    build_and_start
    
    # 检查健康状态
    check_health
    
    # 显示访问信息
    show_access_info
}

# 运行主函数
main "$@"
