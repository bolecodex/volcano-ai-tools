# Docker启动问题解决指南

## 问题诊断

### 1. 网络连接问题
```bash
# 检查网络连接
ping registry-1.docker.io

# 检查Docker配置
docker system info | grep -E "(Registry|Proxy|DNS)"
```

### 2. 代理设置问题
如果您的网络需要代理，请配置Docker代理：

**Windows/Mac (Docker Desktop):**
1. 打开Docker Desktop设置
2. 进入 Resources → Proxies
3. 配置HTTP/HTTPS代理

**Linux:**
```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf > /dev/null << EOF
[Service]
Environment="HTTP_PROXY=http://proxy.example.com:8080"
Environment="HTTPS_PROXY=http://proxy.example.com:8080"
Environment="NO_PROXY=localhost,127.0.0.1"
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 解决方案

### 方案1：使用镜像源
```bash
# 运行网络修复脚本
./fix-docker-network.sh

# 或手动配置
sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
```

### 方案2：使用本地模式
```bash
# 直接使用本地模式启动
./start-local.sh
```

### 方案3：离线Docker构建
```bash
# 构建本地镜像
./build-local-images.sh

# 使用离线配置启动
docker-compose -f docker-compose.offline.yml up -d
```

### 方案4：手动拉取镜像
```bash
# 手动拉取所需镜像
docker pull python:3.9-alpine
docker pull node:18-alpine
docker pull nginx:alpine

# 然后构建项目
docker-compose -f docker-compose.local.yml up --build -d
```

## 常见错误及解决方法

### 1. "context deadline exceeded"
**原因**: 网络超时
**解决**: 使用镜像源或检查网络连接

### 2. "failed to resolve reference"
**原因**: DNS解析失败
**解决**: 配置DNS服务器

### 3. "Address already in use"
**原因**: 端口被占用
**解决**: 
```bash
# 查看端口占用
lsof -i :8000
lsof -i :3000

# 释放端口
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### 4. "Cannot connect to the Docker daemon"
**原因**: Docker服务未启动
**解决**: 启动Docker Desktop或Docker服务

## 推荐方案

对于网络不稳定的环境，推荐使用**本地模式**：

```bash
# 一键启动（自动选择最佳方案）
./start-local.sh
```

本地模式的优势：
- ✅ 无需网络连接
- ✅ 启动速度快
- ✅ 调试方便
- ✅ 资源占用少
