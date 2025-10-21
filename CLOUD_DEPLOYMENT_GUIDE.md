# 火山AI工具 - 云服务器部署指南

## 📋 部署概览

本项目是一个前后端分离的全栈应用，包含：
- **前端**: React + Webpack (端口 3000)
- **后端**: FastAPI + SQLite (端口 8000)

## 🚀 部署方式选择

### 方式一：传统部署（推荐）
直接在云服务器上安装依赖并运行

### 方式二：Docker 部署
使用容器化部署，便于管理和扩展

---

## 方式一：传统部署

### 1. 服务器环境准备

#### 系统要求
- Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- 至少 2GB RAM
- 至少 10GB 磁盘空间
- 公网 IP 和域名（可选）

#### 安装基础环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Python 3.9+
sudo apt install python3 python3-pip python3-venv -y

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Nginx（用于反向代理）
sudo apt install nginx -y

# 安装 Git
sudo apt install git -y

# 安装 PM2（用于进程管理）
sudo npm install -g pm2
```

### 2. 项目部署

#### 克隆项目
```bash
# 创建应用目录
sudo mkdir -p /var/www/volcano-ai-tools
sudo chown $USER:$USER /var/www/volcano-ai-tools

# 克隆项目
cd /var/www/volcano-ai-tools
git clone <your-repository-url> .
```

#### 后端部署
```bash
cd /var/www/volcano-ai-tools/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 创建生产环境配置
cat > .env << EOF
# 数据库配置
DATABASE_URL=sqlite+aiosqlite:///./hs_adk.db

# JWT配置
SECRET_KEY=your-production-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 火山引擎配置（通过前端设置页面配置）
# ARK_API_KEY=your-ark-api-key
# VOLCENGINE_ACCESS_KEY_ID=your-access-key-id
# VOLCENGINE_SECRET_ACCESS_KEY=your-secret-access-key
EOF

# 测试启动
python main.py
```

#### 前端部署
```bash
cd /var/www/volcano-ai-tools/frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 安装静态文件服务器
npm install -g serve

# 测试启动
serve -s build -l 3000
```

### 3. 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/volcano-ai-tools
```

配置内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP

    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:8000/health;
    }
}
```

启用配置：
```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/volcano-ai-tools /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 配置进程管理

#### 创建 PM2 配置文件
```bash
cd /var/www/volcano-ai-tools
nano ecosystem.config.js
```

配置内容：
```javascript
module.exports = {
  apps: [
    {
      name: 'volcano-backend',
      cwd: '/var/www/volcano-ai-tools/backend',
      script: 'main.py',
      interpreter: '/var/www/volcano-ai-tools/backend/venv/bin/python',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'volcano-frontend',
      cwd: '/var/www/volcano-ai-tools/frontend',
      script: 'serve',
      args: '-s build -l 3000',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
```

启动服务：
```bash
# 启动所有服务
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 5. 配置防火墙

```bash
# 开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (如果使用SSL)
sudo ufw enable
```

---

## 方式二：Docker 部署

### 1. 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将用户添加到 docker 组
sudo usermod -aG docker $USER
```

### 2. 创建 Docker 配置文件

#### 后端 Dockerfile
```bash
cd /var/www/volcano-ai-tools/backend
nano Dockerfile
```

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["python", "main.py"]
```

#### 前端 Dockerfile
```bash
cd /var/www/volcano-ai-tools/frontend
nano Dockerfile
```

```dockerfile
# 构建阶段
FROM node:18-alpine as build

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建文件
COPY --from=build /app/build /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose 配置
```bash
cd /var/www/volcano-ai-tools
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./hs_adk.db
      - SECRET_KEY=your-production-secret-key-here
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=30
    volumes:
      - ./backend:/app
      - backend_data:/app/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  backend_data:
```

### 3. 启动 Docker 服务

```bash
# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

---

## 🔧 生产环境优化

### 1. 数据库优化

```bash
# 备份数据库
cp /var/www/volcano-ai-tools/backend/hs_adk.db /var/www/volcano-ai-tools/backend/hs_adk.db.backup

# 设置定期备份
crontab -e
# 添加：0 2 * * * cp /var/www/volcano-ai-tools/backend/hs_adk.db /var/www/volcano-ai-tools/backend/backups/hs_adk_$(date +\%Y\%m\%d).db
```

### 2. 日志管理

```bash
# 创建日志目录
mkdir -p /var/log/volcano-ai-tools

# 配置 PM2 日志
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 3. 监控和健康检查

```bash
# 安装监控工具
npm install -g pm2-logrotate

# 设置监控
pm2 monit
```

---

## 🔒 安全配置

### 1. SSL 证书配置

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. 防火墙配置

```bash
# 配置 UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 3. 系统安全

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 配置自动安全更新
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📊 性能监控

### 1. 系统监控

```bash
# 安装 htop
sudo apt install htop -y

# 监控系统资源
htop
```

### 2. 应用监控

```bash
# PM2 监控
pm2 monit

# 查看应用状态
pm2 status
pm2 logs
```

---

## 🚨 故障排除

### 常见问题

1. **端口被占用**
```bash
# 查看端口占用
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :3000

# 杀死进程
sudo kill -9 <PID>
```

2. **权限问题**
```bash
# 修复文件权限
sudo chown -R $USER:$USER /var/www/volcano-ai-tools
sudo chmod -R 755 /var/www/volcano-ai-tools
```

3. **服务无法启动**
```bash
# 查看详细日志
pm2 logs volcano-backend
pm2 logs volcano-frontend

# 重启服务
pm2 restart all
```

4. **数据库问题**
```bash
# 检查数据库文件
ls -la /var/www/volcano-ai-tools/backend/hs_adk.db

# 重新初始化数据库
cd /var/www/volcano-ai-tools/backend
source venv/bin/activate
python -c "from database import init_db; import asyncio; asyncio.run(init_db())"
```

---

## 📝 部署检查清单

- [ ] 服务器环境准备完成
- [ ] 项目代码部署完成
- [ ] 后端服务正常运行
- [ ] 前端服务正常运行
- [ ] Nginx 反向代理配置完成
- [ ] 防火墙配置完成
- [ ] SSL 证书配置完成（如需要）
- [ ] 进程管理配置完成
- [ ] 日志管理配置完成
- [ ] 监控配置完成
- [ ] 备份策略配置完成

---

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. 检查日志文件：`pm2 logs`
2. 检查服务状态：`pm2 status`
3. 检查 Nginx 状态：`sudo systemctl status nginx`
4. 查看系统资源：`htop`

---

**🎉 部署完成后，您可以通过浏览器访问您的应用了！**
