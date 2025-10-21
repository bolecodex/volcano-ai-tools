# 火山AI工具 - 快速部署指南

## 🚀 一键部署

### 方式一：Docker 部署（推荐）

```bash
# 1. 上传项目到服务器
scp -r . user@your-server:/var/www/volcano-ai-tools

# 2. 登录服务器
ssh user@your-server

# 3. 进入项目目录
cd /var/www/volcano-ai-tools

# 4. 运行一键部署脚本
./deploy-docker.sh
```

### 方式二：传统部署

```bash
# 1. 上传项目到服务器
scp -r . user@your-server:/var/www/volcano-ai-tools

# 2. 登录服务器
ssh user@your-server

# 3. 进入项目目录
cd /var/www/volcano-ai-tools

# 4. 运行部署脚本
./deploy.sh
```

## 📋 部署前准备

### 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **内存**: 至少 2GB RAM
- **磁盘**: 至少 10GB 可用空间
- **网络**: 公网 IP 和域名（可选）

### 本地准备
1. 确保项目代码完整
2. 准备好火山引擎 API 密钥
3. 确保服务器可以访问外网

## 🔧 配置说明

### 1. API 密钥配置

部署完成后，通过以下方式配置 API 密钥：

#### 方式一：通过前端设置页面
1. 访问应用首页
2. 点击"设置"按钮
3. 配置以下密钥：
   - **ARK API Key**: 用于图片生成
   - **Access Key ID**: 用于即梦系列、视频生成等
   - **Secret Access Key**: 对应的密钥

#### 方式二：通过环境变量
编辑 `.env` 文件：
```bash
# 后端配置
ARK_API_KEY=your-ark-api-key
VOLCENGINE_ACCESS_KEY_ID=your-access-key-id
VOLCENGINE_SECRET_ACCESS_KEY=your-secret-access-key
```

### 2. 域名配置

如果需要使用域名访问：

1. 修改 `nginx/nginx.conf` 中的 `server_name`
2. 配置 DNS 解析指向服务器 IP
3. 运行 SSL 证书配置

## 🌐 访问应用

部署完成后，您可以通过以下地址访问：

- **前端应用**: `http://your-server-ip:3000`
- **后端 API**: `http://your-server-ip:8000`
- **API 文档**: `http://your-server-ip:8000/docs`
- **健康检查**: `http://your-server-ip:8000/health`

## 🛠️ 管理命令

### Docker 部署管理
```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新服务
docker-compose pull && docker-compose up -d
```

### 传统部署管理
```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all

# 查看监控
pm2 monit
```

## 🔒 SSL 证书配置

### 使用 Let's Encrypt（免费）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 使用自签名证书（测试用）

```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/C=CN/ST=State/L=City/O=Organization/CN=your-domain.com"
```

## 📊 监控和维护

### 系统监控
```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看网络连接
netstat -tlnp
```

### 应用监控
```bash
# Docker 部署
docker-compose logs -f --tail=100

# 传统部署
pm2 logs --lines 100
```

### 数据库备份
```bash
# 备份数据库
cp backend/hs_adk.db backend/hs_adk.db.backup.$(date +%Y%m%d)

# 设置自动备份
crontab -e
# 添加：0 2 * * * cp /var/www/volcano-ai-tools/backend/hs_adk.db /var/www/volcano-ai-tools/backend/backups/hs_adk_$(date +\%Y\%m\%d).db
```

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
docker-compose logs
# 或
pm2 logs
```

4. **数据库问题**
```bash
# 重新初始化数据库
cd backend
python3 -c "from database import init_db; import asyncio; asyncio.run(init_db())"
```

## 📞 技术支持

如果遇到问题，请：

1. 查看日志文件
2. 检查服务状态
3. 验证配置文件
4. 检查网络连接

---

**🎉 现在您可以开始使用火山AI工具了！**
