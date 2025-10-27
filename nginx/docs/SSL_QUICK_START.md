# SSL 配置快速开始指南

## 📋 配置概览

✅ **已完成的配置**：
- SSL 证书已放置在 `nginx/ssl/` 目录
- Nginx 配置已更新支持 HTTPS
- HTTP 自动重定向到 HTTPS
- 安全响应头已配置
- SSL 性能优化已启用

## 🚀 快速启动

### 方法 1: 使用自动化脚本（推荐）

```bash
# 应用 SSL 配置并重启服务
./apply-ssl.sh

# 验证 SSL 配置
./verify-ssl.sh
```

### 方法 2: 手动操作

#### Docker 环境
```bash
# 重启 nginx 容器
docker compose restart nginx

# 或重启所有服务
docker compose down
docker compose up -d

# 查看日志
docker compose logs -f nginx
```

#### 系统 Nginx
```bash
# 测试配置
sudo nginx -t

# 重启服务
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx
```

## 🔍 验证配置

### 1. 快速测试
```bash
# 测试 HTTP 重定向
curl -I http://hs-ai.top

# 测试 HTTPS 访问
curl -I https://hs-ai.top

# 测试 SSL 证书
openssl s_client -connect hs-ai.top:443 -servername hs-ai.top
```

### 2. 浏览器测试
访问以下地址，应该都能正常工作：
- http://hs-ai.top → 自动重定向到 https://hs-ai.top
- https://hs-ai.top → 显示安全锁图标
- https://www.hs-ai.top → 正常访问

### 3. 在线 SSL 测试
使用 SSL Labs 测试你的 SSL 配置：
```
https://www.ssllabs.com/ssltest/analyze.html?d=hs-ai.top
```

## 📁 文件位置

### 证书文件
- **证书**: `nginx/ssl/hs-ai.top.pem`
- **私钥**: `nginx/ssl/hs-ai.top.key`

### 配置文件
- **Docker 环境**: `nginx/nginx.conf`
- **生产环境**: `nginx/nginx-production.conf`
- **本地开发**: `nginx/nginx-local.conf`

### 脚本文件
- **应用配置**: `apply-ssl.sh`
- **验证配置**: `verify-ssl.sh`

### 文档
- **详细配置文档**: `nginx/docs/SSL_CONFIGURATION.md`
- **快速开始**: `SSL_QUICK_START.md`（本文件）

## 🔧 配置详情

### 支持的域名
- `hs-ai.top`
- `www.hs-ai.top`
- `115.190.184.251` (IP 地址)

### SSL 特性
- ✅ TLS 1.2 和 1.3
- ✅ HTTP/2 支持
- ✅ 强加密套件
- ✅ SSL 会话缓存
- ✅ HSTS 安全头
- ✅ 防止点击劫持
- ✅ XSS 保护

### 端口配置
- **HTTP**: 80 (自动重定向到 HTTPS)
- **HTTPS**: 443

## 🛠️ 故障排查

### 问题 1: 无法访问 HTTPS
```bash
# 检查端口是否开放
sudo netstat -tlnp | grep :443

# 检查防火墙
sudo ufw status
sudo ufw allow 443/tcp

# 查看 nginx 错误日志
docker compose logs nginx
# 或
sudo tail -f /var/log/nginx/error.log
```

### 问题 2: 证书错误
```bash
# 检查证书文件
ls -la nginx/ssl/

# 验证证书
openssl x509 -in nginx/ssl/hs-ai.top.pem -text -noout

# 验证证书和私钥匹配
openssl x509 -noout -modulus -in nginx/ssl/hs-ai.top.pem | openssl md5
openssl rsa -noout -modulus -in nginx/ssl/hs-ai.top.key | openssl md5
```

### 问题 3: HTTP 没有重定向
```bash
# 检查 nginx 配置
docker compose exec nginx nginx -t

# 查看配置文件
cat nginx/nginx.conf | grep -A 5 "listen 80"
```

### 问题 4: Docker 容器问题
```bash
# 查看容器状态
docker compose ps

# 重启容器
docker compose restart nginx

# 查看详细日志
docker compose logs --tail=100 nginx

# 进入容器检查
docker compose exec nginx sh
```

## 📊 监控和维护

### 检查证书有效期
```bash
# 查看证书过期时间
openssl x509 -in nginx/ssl/hs-ai.top.pem -noout -dates

# 计算剩余天数
openssl x509 -in nginx/ssl/hs-ai.top.pem -noout -enddate | cut -d= -f2
```

### 监控 SSL 性能
```bash
# 查看 SSL 握手时间
curl -w "@-" -o /dev/null -s "https://hs-ai.top" <<'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
EOF
```

### 查看访问日志
```bash
# Docker 环境
docker compose exec nginx tail -f /var/log/nginx/access.log

# 系统 nginx
sudo tail -f /var/log/nginx/access.log
```

## 🔐 安全建议

1. **定期更新证书**: 在过期前 30 天续期
2. **保护私钥**: 确保私钥文件权限为 600
3. **监控日志**: 定期检查异常访问
4. **更新 Nginx**: 保持 Nginx 版本最新
5. **备份证书**: 定期备份证书和私钥

## 📝 证书续期流程

当证书即将过期时：

1. **获取新证书**（从证书提供商）

2. **备份旧证书**
```bash
cp nginx/ssl/hs-ai.top.pem nginx/ssl/hs-ai.top.pem.old
cp nginx/ssl/hs-ai.top.key nginx/ssl/hs-ai.top.key.old
```

3. **替换证书文件**
```bash
# 将新证书复制到 nginx/ssl/ 目录
cp /path/to/new/cert.pem nginx/ssl/hs-ai.top.pem
cp /path/to/new/key.pem nginx/ssl/hs-ai.top.key
```

4. **验证新证书**
```bash
openssl x509 -in nginx/ssl/hs-ai.top.pem -text -noout
```

5. **应用配置**
```bash
./apply-ssl.sh
```

6. **验证更新**
```bash
./verify-ssl.sh
```

## 🌐 DNS 配置

确保你的域名 DNS 记录正确指向服务器：

```
A     hs-ai.top        → 115.190.184.251
A     www.hs-ai.top    → 115.190.184.251
```

检查 DNS 解析：
```bash
# 检查域名解析
dig hs-ai.top +short
dig www.hs-ai.top +short

# 或使用 nslookup
nslookup hs-ai.top
nslookup www.hs-ai.top
```

## 📞 获取帮助

如果遇到问题：

1. **查看详细文档**: `nginx/docs/SSL_CONFIGURATION.md`
2. **运行验证脚本**: `./verify-ssl.sh`
3. **查看日志**: `docker compose logs nginx`
4. **测试配置**: `docker compose exec nginx nginx -t`

## ✅ 配置检查清单

在部署前确认：

- [ ] 证书文件已放置在 `nginx/ssl/` 目录
- [ ] 证书和私钥文件权限正确
- [ ] Nginx 配置文件已更新
- [ ] 域名 DNS 记录已配置
- [ ] 防火墙已开放 80 和 443 端口
- [ ] 已测试 nginx 配置语法
- [ ] 已重启 nginx 服务
- [ ] HTTP 重定向到 HTTPS 正常工作
- [ ] HTTPS 访问正常
- [ ] 浏览器显示安全锁图标

## 🎉 完成！

现在你的网站已经配置了 SSL 证书，所有 HTTP 流量都会自动重定向到 HTTPS。

访问你的网站：
- 🌐 https://hs-ai.top
- 🌐 https://www.hs-ai.top

享受安全的 HTTPS 连接！🔒
