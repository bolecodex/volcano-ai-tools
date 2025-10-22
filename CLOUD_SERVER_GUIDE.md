# 云服务器部署指南

## 问题分析

在云服务器上遇到的主要问题：
1. **Python虚拟环境创建失败** - 缺少 `python3-venv` 包
2. **pip版本过旧** - 系统pip版本20.0.2，存在兼容性问题
3. **OpenSSL库版本冲突** - 导致cryptography包无法正常工作

## 解决方案

### 方案1：使用云服务器专用脚本（推荐）

```bash
# 1. 修复环境
./fix-cloud-environment.sh

# 2. 启动服务
./start-cloud.sh
```

### 方案2：手动修复

#### 对于Ubuntu/Debian系统：
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要依赖
sudo apt install -y python3 python3-pip python3-venv python3-dev python3-setuptools
sudo apt install -y build-essential libssl-dev libffi-dev
sudo apt install -y nodejs npm

# 修复pip环境
sudo apt remove -y python3-openssl python3-cryptography
sudo apt install -y python3-openssl python3-cryptography --reinstall

# 升级pip
python3 -m pip install --upgrade pip
```

#### 对于CentOS/RHEL系统：
```bash
# 更新系统
sudo yum update -y

# 安装必要依赖
sudo yum install -y python3 python3-pip python3-devel python3-setuptools
sudo yum install -y gcc gcc-c++ make openssl-devel libffi-devel
sudo yum install -y nodejs npm

# 升级pip
python3 -m pip install --upgrade pip
```

### 方案3：使用Docker（如果网络正常）

```bash
# 使用Docker部署
docker-compose -f docker-compose.local.yml up --build -d
```

## 云服务器配置建议

### 1. 系统要求
- **操作系统**: Ubuntu 18.04+ / CentOS 7+
- **内存**: 至少2GB RAM
- **存储**: 至少10GB可用空间
- **网络**: 稳定的网络连接

### 2. 安全配置
```bash
# 配置防火墙
sudo ufw allow 8000  # 后端API端口
sudo ufw allow 3000  # 前端端口
sudo ufw allow 80    # HTTP端口
sudo ufw allow 443   # HTTPS端口
sudo ufw enable
```

### 3. 进程管理
```bash
# 使用systemd管理服务
sudo systemctl enable volcano-backend
sudo systemctl enable volcano-frontend
```

## 常见问题解决

### 1. Python虚拟环境创建失败
```bash
# 安装python3-venv包
sudo apt install python3-venv  # Ubuntu/Debian
sudo yum install python3-venv  # CentOS/RHEL
```

### 2. pip版本过旧
```bash
# 升级pip
python3 -m pip install --upgrade pip
```

### 3. OpenSSL库冲突
```bash
# 重新安装相关包
sudo apt remove python3-openssl python3-cryptography
sudo apt install python3-openssl python3-cryptography --reinstall
```

### 4. 端口被占用
```bash
# 查看端口占用
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :3000

# 释放端口
sudo kill -9 <PID>
```

## 生产环境部署

### 1. 使用Nginx反向代理
```bash
# 安装Nginx
sudo apt install nginx  # Ubuntu/Debian
sudo yum install nginx  # CentOS/RHEL

# 配置反向代理
sudo cp nginx/nginx-local.conf /etc/nginx/sites-available/volcano-ai
sudo ln -s /etc/nginx/sites-available/volcano-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. 使用PM2管理Node.js进程
```bash
# 安装PM2
npm install -g pm2

# 启动前端服务
cd frontend
pm2 start npm --name "volcano-frontend" -- start
pm2 save
pm2 startup
```

### 3. 使用systemd管理Python服务
```bash
# 创建systemd服务文件
sudo tee /etc/systemd/system/volcano-backend.service > /dev/null << 'EOF'
[Unit]
Description=Volcano AI Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/volcano-ai-tools/backend
Environment=PATH=/root/volcano-ai-tools/backend/venv/bin
ExecStart=/root/volcano-ai-tools/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 启用服务
sudo systemctl daemon-reload
sudo systemctl enable volcano-backend
sudo systemctl start volcano-backend
```

## 监控和日志

### 1. 查看服务状态
```bash
# 检查后端状态
curl http://localhost:8000/health

# 检查前端状态
curl http://localhost:3000

# 查看进程
ps aux | grep -E "(python|node)"
```

### 2. 查看日志
```bash
# 后端日志
tail -f backend/logs/backend.log

# 系统日志
sudo journalctl -u volcano-backend -f
```

## 快速启动命令

```bash
# 一键修复和启动
./fix-cloud-environment.sh && ./start-cloud.sh
```

## 故障排除

如果遇到问题，请按以下顺序检查：

1. **系统环境**: 确保Python3和Node.js已正确安装
2. **网络连接**: 确保服务器可以访问外网
3. **端口占用**: 确保8000和3000端口未被占用
4. **权限问题**: 确保有足够的文件权限
5. **依赖问题**: 确保所有Python和Node.js依赖已正确安装

更多帮助请查看 `DOCKER_TROUBLESHOOTING.md` 和 `LOCAL_RUN_GUIDE.md`。
