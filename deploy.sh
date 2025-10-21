#!/bin/bash

# 火山AI工具 - 云服务器部署脚本
# 使用方法: ./deploy.sh [传统部署|docker]

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

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "请不要使用root用户运行此脚本"
        exit 1
    fi
}

# 检查系统要求
check_system() {
    log_info "检查系统要求..."
    
    # 检查操作系统
    if [[ ! -f /etc/os-release ]]; then
        log_error "不支持的操作系统"
        exit 1
    fi
    
    . /etc/os-release
    log_info "检测到操作系统: $NAME $VERSION"
    
    # 检查内存
    MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [ $MEMORY -lt 2048 ]; then
        log_warning "建议至少2GB内存，当前: ${MEMORY}MB"
    fi
    
    # 检查磁盘空间
    DISK=$(df -h / | awk 'NR==2{print $4}' | sed 's/G//')
    if [ $DISK -lt 10 ]; then
        log_warning "建议至少10GB磁盘空间，当前可用: ${DISK}GB"
    fi
}

# 安装基础依赖
install_dependencies() {
    log_info "安装基础依赖..."
    
    # 更新包列表
    sudo apt update
    
    # 安装基础工具
    sudo apt install -y curl wget git unzip
    
    # 安装Python 3.9+
    if ! command -v python3 &> /dev/null; then
        log_info "安装Python..."
        sudo apt install -y python3 python3-pip python3-venv
    else
        log_info "Python已安装: $(python3 --version)"
    fi
    
    # 安装Node.js 18+
    if ! command -v node &> /dev/null; then
        log_info "安装Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        log_info "Node.js已安装: $(node --version)"
    fi
    
    # 安装Nginx
    if ! command -v nginx &> /dev/null; then
        log_info "安装Nginx..."
        sudo apt install -y nginx
    else
        log_info "Nginx已安装: $(nginx -v 2>&1)"
    fi
    
    # 安装PM2
    if ! command -v pm2 &> /dev/null; then
        log_info "安装PM2..."
        sudo npm install -g pm2
    else
        log_info "PM2已安装: $(pm2 --version)"
    fi
}

# 传统部署
deploy_traditional() {
    log_info "开始传统部署..."
    
    # 创建应用目录
    APP_DIR="/var/www/volcano-ai-tools"
    log_info "创建应用目录: $APP_DIR"
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    # 复制项目文件
    log_info "复制项目文件..."
    cp -r . $APP_DIR/
    cd $APP_DIR
    
    # 部署后端
    log_info "部署后端..."
    cd backend
    
    # 创建虚拟环境
    python3 -m venv venv
    source venv/bin/activate
    
    # 安装依赖
    pip install -r requirements.txt
    
    # 创建生产环境配置
    if [ ! -f .env ]; then
        log_info "创建生产环境配置..."
        cat > .env << EOF
DATABASE_URL=sqlite+aiosqlite:///./hs_adk.db
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
    fi
    
    # 部署前端
    log_info "部署前端..."
    cd ../frontend
    
    # 安装依赖
    npm install
    
    # 构建生产版本
    npm run build
    
    # 安装静态文件服务器
    npm install -g serve
    
    # 配置Nginx
    log_info "配置Nginx..."
    sudo cp ../nginx/nginx.conf /etc/nginx/sites-available/volcano-ai-tools
    sudo ln -sf /etc/nginx/sites-available/volcano-ai-tools /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试Nginx配置
    sudo nginx -t
    
    # 启动服务
    log_info "启动服务..."
    cd $APP_DIR
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    # 重启Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    log_success "传统部署完成！"
    log_info "应用访问地址: http://$(curl -s ifconfig.me)"
}

# Docker部署
deploy_docker() {
    log_info "开始Docker部署..."
    
    # 安装Docker
    if ! command -v docker &> /dev/null; then
        log_info "安装Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    else
        log_info "Docker已安装: $(docker --version)"
    fi
    
    # 安装Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_info "安装Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        log_info "Docker Compose已安装: $(docker-compose --version)"
    fi
    
    # 创建日志目录
    sudo mkdir -p /var/log/volcano-ai-tools
    sudo chown $USER:$USER /var/log/volcano-ai-tools
    
    # 构建并启动服务
    log_info "构建并启动Docker服务..."
    docker-compose up -d --build
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    docker-compose ps
    
    log_success "Docker部署完成！"
    log_info "应用访问地址: http://$(curl -s ifconfig.me)"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    # 安装UFW
    sudo apt install -y ufw
    
    # 配置防火墙规则
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    log_success "防火墙配置完成"
}

# 设置SSL证书
setup_ssl() {
    read -p "是否设置SSL证书？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "安装Certbot..."
        sudo apt install -y certbot python3-certbot-nginx
        
        read -p "请输入您的域名: " DOMAIN
        if [ ! -z "$DOMAIN" ]; then
            log_info "获取SSL证书..."
            sudo certbot --nginx -d $DOMAIN
            
            # 设置自动续期
            (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
            log_success "SSL证书配置完成"
        fi
    fi
}

# 主函数
main() {
    log_info "火山AI工具 - 云服务器部署脚本"
    log_info "=================================="
    
    # 检查系统
    check_root
    check_system
    
    # 选择部署方式
    if [ "$1" = "docker" ]; then
        DEPLOY_TYPE="docker"
    else
        DEPLOY_TYPE="traditional"
    fi
    
    log_info "部署方式: $DEPLOY_TYPE"
    
    # 安装依赖
    install_dependencies
    
    # 配置防火墙
    configure_firewall
    
    # 执行部署
    if [ "$DEPLOY_TYPE" = "docker" ]; then
        deploy_docker
    else
        deploy_traditional
    fi
    
    # 设置SSL证书
    setup_ssl
    
    log_success "部署完成！"
    log_info "=================================="
    log_info "访问地址: http://$(curl -s ifconfig.me)"
    log_info "API文档: http://$(curl -s ifconfig.me)/docs"
    log_info "健康检查: http://$(curl -s ifconfig.me)/health"
    log_info "=================================="
    log_info "管理命令:"
    if [ "$DEPLOY_TYPE" = "docker" ]; then
        log_info "  查看服务状态: docker-compose ps"
        log_info "  查看日志: docker-compose logs -f"
        log_info "  重启服务: docker-compose restart"
        log_info "  停止服务: docker-compose down"
    else
        log_info "  查看服务状态: pm2 status"
        log_info "  查看日志: pm2 logs"
        log_info "  重启服务: pm2 restart all"
        log_info "  停止服务: pm2 stop all"
    fi
}

# 运行主函数
main "$@"
