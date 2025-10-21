# 火山AI工具 - 火山引擎ECS部署指南

## 🎯 推荐部署方式：Docker部署

针对火山引擎ECS，强烈推荐使用**Docker部署**，原因如下：
- ✅ 火山引擎ECS对Docker支持完善
- ✅ 便于容器编排和管理
- ✅ 支持弹性伸缩
- ✅ 环境隔离，部署稳定
- ✅ 便于后续迁移和扩展

## 🚀 快速部署步骤

### 1. 准备ECS实例

#### 推荐配置
- **实例规格**: ecs.g1.2xlarge (2核4GB) 或更高
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 7.9
- **存储**: 系统盘40GB + 数据盘20GB
- **网络**: 公网IP + 安全组配置

#### 安全组配置
开放以下端口：
- **22**: SSH访问
- **80**: HTTP访问
- **443**: HTTPS访问
- **8000**: 后端API（可选，通过Nginx代理）
- **3000**: 前端服务（可选，通过Nginx代理）

### 2. 连接ECS实例

```bash
# 使用SSH连接
ssh root@your-ecs-ip

# 或使用火山引擎控制台的Web Shell
```

### 3. 一键部署

```bash
# 1. 下载项目代码
git clone <your-repository-url>
cd volcano-ai-tools

# 2. 运行Docker部署脚本
./deploy-docker.sh
```

## 🔧 火山引擎ECS优化配置

### 1. 创建优化的Docker Compose配置

```yaml
# docker-compose.ecs.yml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: volcano-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./data/hs_adk.db
      - SECRET_KEY=${SECRET_KEY:-$(openssl rand -hex 32)}
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=30
      - HOST=0.0.0.0
      - PORT=8000
    volumes:
      - backend_data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  frontend:
    build: ./frontend
    container_name: volcano-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  nginx:
    image: nginx:alpine
    container_name: volcano-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

volumes:
  backend_data:
    driver: local
```

### 2. 创建ECS专用部署脚本

```bash
#!/bin/bash
# deploy-ecs.sh - 火山引擎ECS专用部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查系统
check_system() {
    log_info "检查系统环境..."
    
    # 检查是否为root用户
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用root用户运行此脚本"
        exit 1
    fi
    
    # 检查操作系统
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        log_info "操作系统: $NAME $VERSION"
    fi
}

# 安装Docker
install_docker() {
    if ! command -v docker &> /dev/null; then
        log_info "安装Docker..."
        
        # 更新包管理器
        apt-get update
        
        # 安装必要的包
        apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        
        # 添加Docker官方GPG密钥
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # 添加Docker仓库
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # 安装Docker
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io
        
        # 启动Docker服务
        systemctl start docker
        systemctl enable docker
        
        log_success "Docker安装完成"
    else
        log_info "Docker已安装: $(docker --version)"
    fi
}

# 安装Docker Compose
install_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_info "安装Docker Compose..."
        
        # 下载Docker Compose
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        
        # 添加执行权限
        chmod +x /usr/local/bin/docker-compose
        
        # 创建软链接
        ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
        
        log_success "Docker Compose安装完成"
    else
        log_info "Docker Compose已安装: $(docker-compose --version)"
    fi
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    # 安装UFW
    apt-get install -y ufw
    
    # 配置防火墙规则
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    log_success "防火墙配置完成"
}

# 创建必要目录
create_directories() {
    log_info "创建必要目录..."
    
    mkdir -p nginx/ssl
    mkdir -p logs/nginx
    mkdir -p data
    mkdir -p backups
    
    log_success "目录创建完成"
}

# 生成SSL证书
generate_ssl_cert() {
    if [ ! -f nginx/ssl/cert.pem ]; then
        log_info "生成SSL自签名证书..."
        
        # 安装OpenSSL
        apt-get install -y openssl
        
        # 生成证书
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=VolcanoAI/CN=localhost"
        
        log_success "SSL证书生成完成"
    else
        log_info "SSL证书已存在"
    fi
}

# 创建环境配置
create_env_config() {
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
LOG_FILE=/app/logs/backend.log

# 火山引擎配置（通过前端设置页面配置）
# ARK_API_KEY=your-ark-api-key
# VOLCENGINE_ACCESS_KEY_ID=your-access-key-id
# VOLCENGINE_SECRET_ACCESS_KEY=your-secret-access-key
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
    docker-compose -f docker-compose.ecs.yml down 2>/dev/null || true
    
    # 构建并启动服务
    docker-compose -f docker-compose.ecs.yml up -d --build
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    log_info "检查服务状态..."
    docker-compose -f docker-compose.ecs.yml ps
}

# 设置自动启动
setup_auto_start() {
    log_info "设置自动启动..."
    
    # 创建systemd服务文件
    cat > /etc/systemd/system/volcano-ai.service << EOF
[Unit]
Description=Volcano AI Tools
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/volcano-ai-tools
ExecStart=/usr/bin/docker-compose -f docker-compose.ecs.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.ecs.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    # 重新加载systemd
    systemctl daemon-reload
    
    # 启用服务
    systemctl enable volcano-ai.service
    
    log_success "自动启动配置完成"
}

# 设置日志轮转
setup_log_rotation() {
    log_info "设置日志轮转..."
    
    # 安装logrotate
    apt-get install -y logrotate
    
    # 创建logrotate配置
    cat > /etc/logrotate.d/volcano-ai << EOF
/root/volcano-ai-tools/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        /usr/bin/docker-compose -f /root/volcano-ai-tools/docker-compose.ecs.yml restart nginx
    endscript
}
EOF
    
    log_success "日志轮转配置完成"
}

# 设置监控
setup_monitoring() {
    log_info "设置监控..."
    
    # 安装htop
    apt-get install -y htop
    
    # 创建监控脚本
    cat > /root/monitor.sh << 'EOF'
#!/bin/bash
echo "=== 系统资源监控 ==="
echo "内存使用:"
free -h
echo
echo "磁盘使用:"
df -h
echo
echo "Docker容器状态:"
docker-compose -f /root/volcano-ai-tools/docker-compose.ecs.yml ps
echo
echo "服务健康检查:"
curl -f http://localhost:8000/health && echo "后端服务正常" || echo "后端服务异常"
curl -f http://localhost:3000 && echo "前端服务正常" || echo "前端服务异常"
EOF
    
    chmod +x /root/monitor.sh
    
    # 设置定时监控
    (crontab -l 2>/dev/null; echo "*/5 * * * * /root/monitor.sh >> /root/monitor.log 2>&1") | crontab -
    
    log_success "监控配置完成"
}

# 显示访问信息
show_access_info() {
    # 获取公网IP
    PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "your-server-ip")
    
    log_success "部署完成！"
    echo
    log_info "=================================="
    log_info "访问信息:"
    log_info "  前端应用: http://$PUBLIC_IP"
    log_info "  后端API: http://$PUBLIC_IP:8000"
    log_info "  API文档: http://$PUBLIC_IP:8000/docs"
    log_info "  健康检查: http://$PUBLIC_IP:8000/health"
    log_info "=================================="
    echo
    log_info "管理命令:"
    log_info "  查看服务状态: docker-compose -f docker-compose.ecs.yml ps"
    log_info "  查看日志: docker-compose -f docker-compose.ecs.yml logs -f"
    log_info "  重启服务: docker-compose -f docker-compose.ecs.yml restart"
    log_info "  停止服务: docker-compose -f docker-compose.ecs.yml down"
    log_info "  系统监控: /root/monitor.sh"
    echo
}

# 主函数
main() {
    log_info "火山AI工具 - 火山引擎ECS部署"
    log_info "=============================="
    
    # 检查系统
    check_system
    
    # 安装Docker
    install_docker
    
    # 安装Docker Compose
    install_docker_compose
    
    # 配置防火墙
    configure_firewall
    
    # 创建目录
    create_directories
    
    # 生成SSL证书
    generate_ssl_cert
    
    # 创建环境配置
    create_env_config
    
    # 构建和启动
    build_and_start
    
    # 设置自动启动
    setup_auto_start
    
    # 设置日志轮转
    setup_log_rotation
    
    # 设置监控
    setup_monitoring
    
    # 显示访问信息
    show_access_info
}

# 运行主函数
main "$@"
```

## 🔧 火山引擎ECS特殊配置

### 1. 使用火山引擎对象存储（TOS）

如果使用火山引擎TOS存储文件，需要配置：

```bash
# 在.env文件中添加TOS配置
TOS_ENDPOINT=your-tos-endpoint
TOS_REGION=your-region
TOS_ACCESS_KEY_ID=your-access-key-id
TOS_SECRET_ACCESS_KEY=your-secret-access-key
TOS_BUCKET_NAME=your-bucket-name
```

### 2. 使用火山引擎负载均衡

如果需要使用火山引擎的负载均衡器：

1. 在火山引擎控制台创建负载均衡器
2. 配置后端服务器组，添加ECS实例
3. 配置监听器，转发到80端口
4. 配置健康检查路径：`/health`

### 3. 使用火山引擎RDS

如果需要使用火山引擎RDS替代SQLite：

```bash
# 修改DATABASE_URL
DATABASE_URL=mysql://username:password@rds-endpoint:3306/database_name
```

## 📊 监控和维护

### 1. 系统监控

```bash
# 查看系统资源
htop

# 查看Docker容器状态
docker-compose -f docker-compose.ecs.yml ps

# 查看服务日志
docker-compose -f docker-compose.ecs.yml logs -f
```

### 2. 自动备份

```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# 备份数据库
cp /root/volcano-ai-tools/data/hs_adk.db $BACKUP_DIR/hs_adk_$DATE.db

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /root/volcano-ai-tools/.env /root/volcano-ai-tools/nginx/

# 清理旧备份（保留30天）
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x /root/backup.sh

# 设置定时备份
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup.sh") | crontab -
```

## 🚨 故障排除

### 常见问题

1. **容器无法启动**
```bash
# 查看容器日志
docker-compose -f docker-compose.ecs.yml logs

# 检查端口占用
netstat -tlnp | grep :8000
netstat -tlnp | grep :3000
```

2. **内存不足**
```bash
# 查看内存使用
free -h
docker stats

# 调整容器内存限制
# 编辑docker-compose.ecs.yml中的deploy.resources.limits.memory
```

3. **磁盘空间不足**
```bash
# 查看磁盘使用
df -h

# 清理Docker镜像
docker system prune -a

# 清理日志文件
find /root/volcano-ai-tools/logs -name "*.log" -mtime +7 -delete
```

## 📞 技术支持

如果遇到问题，请：

1. 查看系统监控：`/root/monitor.sh`
2. 查看服务日志：`docker-compose -f docker-compose.ecs.yml logs`
3. 检查系统资源：`htop`、`df -h`
4. 查看防火墙状态：`ufw status`

---

**🎉 现在您可以在火山引擎ECS上成功部署火山AI工具了！**
