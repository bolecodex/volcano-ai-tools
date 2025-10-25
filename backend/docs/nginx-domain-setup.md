# Nginx 域名配置指南

本文档说明如何为 `www.hs-ai.top` 域名配置 nginx 反向代理和 SSL 证书。

## 📋 配置概览

- **域名**: www.hs-ai.top / hs-ai.top
- **Web 服务器**: Nginx
- **SSL 证书**: Let's Encrypt (免费)
- **前端端口**: 3000
- **后端端口**: 8000

## ✅ 已完成的配置

### 1. Nginx 安装

已安装以下软件包：
- nginx
- certbot
- python3-certbot-nginx

### 2. Nginx 站点配置

配置文件位置：`/etc/nginx/sites-available/hs-ai.top`

配置内容包括：
- HTTP 服务（80 端口）
- 前端代理（转发到 localhost:3000）
- 后端 API 代理（转发到 localhost:8000）
- 健康检查端点
- 静态资源缓存优化

### 3. 服务状态

```bash
# 查看 nginx 状态
sudo systemctl status nginx

# 重启 nginx
sudo systemctl restart nginx

# 测试配置
sudo nginx -t
```

## 🔧 后续配置步骤

### 步骤 1: 配置 DNS 解析

在您的域名服务商（如阿里云、腾讯云等）添加 DNS 记录：

**A 记录配置：**
```
主机记录: www
记录类型: A
记录值: [您的服务器IP]
TTL: 600
```

**可选：添加根域名记录**
```
主机记录: @
记录类型: A
记录值: [您的服务器IP]
TTL: 600
```

**查看服务器 IP：**
```bash
curl ifconfig.me
```

### 步骤 2: 启动应用服务

确保前端和后端服务正在运行：

**启动后端（8000 端口）：**
```bash
cd /root/volcano-ai-tools
./start-backend.sh
```

**启动前端（3000 端口）：**
```bash
cd /root/volcano-ai-tools
./start-frontend.sh
```

**或使用 Docker Compose：**
```bash
cd /root/volcano-ai-tools
docker-compose up -d
```

### 步骤 3: 配置 SSL 证书

等待 DNS 解析生效后（通常 5-10 分钟），运行 SSL 配置脚本：

```bash
cd /root/volcano-ai-tools
sudo ./setup-ssl.sh
```

脚本会自动：
1. 检查域名解析
2. 请求 Let's Encrypt SSL 证书
3. 配置 HTTPS 重定向
4. 重启 nginx

**手动配置 SSL（可选）：**
```bash
sudo certbot --nginx -d www.hs-ai.top -d hs-ai.top
```

## 🔍 验证配置

### 检查 DNS 解析

```bash
# 检查域名解析
dig www.hs-ai.top

# 或使用 nslookup
nslookup www.hs-ai.top
```

### 测试 HTTP 访问

```bash
# 测试 HTTP
curl -I http://www.hs-ai.top

# 测试 HTTPS（配置 SSL 后）
curl -I https://www.hs-ai.top

# 测试 API 端点
curl http://www.hs-ai.top/health
```

### 查看日志

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/hs-ai.top-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/hs-ai.top-error.log

# Nginx 主错误日志
sudo tail -f /var/log/nginx/error.log
```

## 🔐 SSL 证书管理

### 证书自动续期

Certbot 已配置自动续期，证书会在过期前自动更新。

**测试自动续期：**
```bash
sudo certbot renew --dry-run
```

**手动续期：**
```bash
sudo certbot renew
```

### 查看证书信息

```bash
sudo certbot certificates
```

## 🚀 性能优化

当前配置已包含以下优化：

1. **Gzip 压缩**: 自动压缩文本资源
2. **静态资源缓存**: 1年缓存期
3. **HTTP/2**: 支持 HTTP/2 协议
4. **连接保持**: 优化的 keepalive 设置
5. **代理超时**: 60秒超时设置

## 🛡️ 安全配置

已启用的安全头：

- `X-Frame-Options: DENY` - 防止点击劫持
- `X-Content-Type-Options: nosniff` - 防止 MIME 类型嗅探
- `X-XSS-Protection` - XSS 保护
- `Strict-Transport-Security` - 强制 HTTPS（SSL 配置后）

## 📊 监控和维护

### 检查服务状态

```bash
# Nginx 状态
sudo systemctl status nginx

# 后端服务状态
curl http://localhost:8000/health

# 前端服务状态
curl http://localhost:3000
```

### 重启服务

```bash
# 重启 nginx
sudo systemctl restart nginx

# 重新加载配置（无需停机）
sudo nginx -s reload
```

## 🐛 故障排查

### 问题 1: 域名无法访问

**检查项：**
1. DNS 是否已解析：`dig www.hs-ai.top`
2. Nginx 是否运行：`sudo systemctl status nginx`
3. 端口是否开放：`sudo netstat -tlnp | grep nginx`
4. 防火墙设置：`sudo ufw status`

### 问题 2: 502 Bad Gateway

**可能原因：**
1. 后端服务未启动
2. 端口配置错误

**检查命令：**
```bash
# 检查后端服务
curl http://localhost:8000/health

# 检查前端服务
curl http://localhost:3000

# 查看 nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题 3: SSL 证书获取失败

**可能原因：**
1. DNS 未解析到正确 IP
2. 80 端口被占用
3. 域名已有证书

**解决方法：**
```bash
# 检查 80 端口
sudo netstat -tlnp | grep :80

# 删除旧证书重新申请
sudo certbot delete --cert-name www.hs-ai.top
sudo certbot --nginx -d www.hs-ai.top -d hs-ai.top
```

## 📝 配置文件位置

- Nginx 主配置：`/etc/nginx/nginx.conf`
- 站点配置：`/etc/nginx/sites-available/hs-ai.top`
- 站点启用：`/etc/nginx/sites-enabled/hs-ai.top`
- SSL 证书：`/etc/letsencrypt/live/www.hs-ai.top/`
- 访问日志：`/var/log/nginx/hs-ai.top-access.log`
- 错误日志：`/var/log/nginx/hs-ai.top-error.log`

## 🔄 更新配置

修改配置后，需要测试并重启：

```bash
# 测试配置
sudo nginx -t

# 重新加载配置（推荐，无停机）
sudo nginx -s reload

# 或完全重启
sudo systemctl restart nginx
```

## 📞 相关命令速查

```bash
# 启动 nginx
sudo systemctl start nginx

# 停止 nginx
sudo systemctl stop nginx

# 重启 nginx
sudo systemctl restart nginx

# 重新加载配置
sudo nginx -s reload

# 测试配置
sudo nginx -t

# 查看版本
nginx -v

# 查看编译参数
nginx -V
```

## 🎯 下一步

1. ✅ 确认 DNS 已解析到服务器
2. ✅ 启动前后端应用服务
3. ✅ 运行 SSL 配置脚本
4. ✅ 测试 HTTPS 访问
5. ✅ 配置监控和告警（可选）

---

**配置完成日期**: 2025-10-25  
**维护人员**: 系统管理员
