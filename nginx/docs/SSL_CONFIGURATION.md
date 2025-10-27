# SSL 证书配置指南

## 配置概述

已成功配置 SSL 证书到 nginx，实现 HTTPS 访问和 HTTP 自动重定向。

## 配置详情

### 1. SSL 证书文件

证书文件已放置在 `nginx/ssl/` 目录下：
- **证书文件**: `hs-ai.top.pem`
- **私钥文件**: `hs-ai.top.key`

### 2. Nginx 配置

已更新以下配置文件：

#### nginx/nginx.conf (Docker 环境)
- 配置了 HTTP 到 HTTPS 的 301 重定向
- 配置了 HTTPS 服务器监听 443 端口
- 启用了 HTTP/2 协议
- 配置了 SSL 证书路径
- 添加了安全响应头

#### nginx/nginx-production.conf (生产环境)
- 同样配置了 HTTPS 和 HTTP 重定向
- 支持域名和 IP 地址访问

### 3. 支持的域名

配置支持以下域名和地址：
- `hs-ai.top`
- `www.hs-ai.top`
- `115.190.184.251` (IP 地址)

### 4. SSL 配置特性

#### 安全协议
- TLS 1.2
- TLS 1.3

#### 加密套件
- ECDHE-RSA-AES128-GCM-SHA256
- ECDHE-RSA-AES256-GCM-SHA384
- ECDHE-RSA-AES128-SHA256
- ECDHE-RSA-AES256-SHA384

#### 性能优化
- SSL 会话缓存：10MB 共享缓存
- 会话超时：10 分钟

#### 安全响应头
- `X-Frame-Options: DENY` - 防止点击劫持
- `X-Content-Type-Options: nosniff` - 防止 MIME 类型嗅探
- `X-XSS-Protection: 1; mode=block` - XSS 保护
- `Strict-Transport-Security` - 强制使用 HTTPS（HSTS）

## 应用配置

### 使用 Docker Compose

1. **重启 nginx 容器**：
```bash
docker compose restart nginx
```

2. **或者重启所有服务**：
```bash
docker compose down
docker compose up -d
```

3. **验证配置**：
```bash
# 检查 nginx 配置语法
docker compose exec nginx nginx -t

# 查看 nginx 日志
docker compose logs nginx

# 查看容器状态
docker compose ps
```

### 使用系统 Nginx（生产环境）

如果使用系统级别的 nginx：

1. **测试配置**：
```bash
sudo nginx -t
```

2. **重新加载配置**：
```bash
sudo systemctl reload nginx
```

3. **重启 nginx**：
```bash
sudo systemctl restart nginx
```

## 验证 HTTPS

### 1. 检查证书
```bash
# 使用 openssl 检查证书
openssl s_client -connect hs-ai.top:443 -servername hs-ai.top

# 查看证书详情
openssl x509 -in nginx/ssl/hs-ai.top.pem -text -noout
```

### 2. 测试 HTTP 重定向
```bash
# 测试 HTTP 请求是否重定向到 HTTPS
curl -I http://hs-ai.top

# 应该返回 301 重定向到 https://hs-ai.top
```

### 3. 测试 HTTPS 访问
```bash
# 测试 HTTPS 访问
curl -I https://hs-ai.top

# 应该返回 200 OK
```

### 4. 浏览器测试
在浏览器中访问：
- `http://hs-ai.top` - 应该自动重定向到 HTTPS
- `https://hs-ai.top` - 应该显示安全锁图标
- `https://www.hs-ai.top` - 应该正常访问

## 故障排查

### 证书问题

1. **检查证书文件权限**：
```bash
ls -la nginx/ssl/
# 确保文件可读
```

2. **验证证书和私钥匹配**：
```bash
# 证书的 MD5
openssl x509 -noout -modulus -in nginx/ssl/hs-ai.top.pem | openssl md5

# 私钥的 MD5
openssl rsa -noout -modulus -in nginx/ssl/hs-ai.top.key | openssl md5

# 两者应该相同
```

### Nginx 配置问题

1. **查看错误日志**：
```bash
# Docker 环境
docker compose logs nginx

# 系统 nginx
sudo tail -f /var/log/nginx/error.log
```

2. **检查端口占用**：
```bash
# 检查 443 端口
sudo netstat -tlnp | grep :443

# 或使用 ss
sudo ss -tlnp | grep :443
```

### 防火墙设置

确保防火墙允许 HTTPS 流量：

```bash
# UFW
sudo ufw allow 443/tcp
sudo ufw status

# iptables
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -L -n
```

## 证书续期

SSL 证书通常有有效期限制，需要定期续期：

1. **检查证书有效期**：
```bash
openssl x509 -in nginx/ssl/hs-ai.top.pem -noout -dates
```

2. **续期步骤**：
   - 从证书提供商获取新证书
   - 替换 `nginx/ssl/` 目录下的证书文件
   - 重启 nginx 服务

## 性能优化建议

### 1. 启用 OCSP Stapling
在 nginx 配置中添加：
```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/nginx/ssl/hs-ai.top.pem;
```

### 2. 调整 SSL 缓冲区
```nginx
ssl_buffer_size 4k;
```

### 3. 启用 TLS 1.3 0-RTT（谨慎使用）
```nginx
ssl_early_data on;
```

## 安全建议

1. **定期更新证书**：在证书过期前及时续期
2. **保护私钥**：确保私钥文件权限设置正确（600）
3. **监控证书过期**：设置提醒在证书过期前 30 天续期
4. **使用强密码套件**：定期更新加密套件配置
5. **启用 HSTS**：已配置，强制浏览器使用 HTTPS

## 相关文件

- `/root/volcano-ai-tools/nginx/nginx.conf` - Docker 环境配置
- `/root/volcano-ai-tools/nginx/nginx-production.conf` - 生产环境配置
- `/root/volcano-ai-tools/nginx/ssl/hs-ai.top.pem` - SSL 证书
- `/root/volcano-ai-tools/nginx/ssl/hs-ai.top.key` - SSL 私钥
- `/root/volcano-ai-tools/docker-compose.yml` - Docker Compose 配置

## 总结

✅ SSL 证书已配置完成
✅ HTTP 自动重定向到 HTTPS
✅ 支持 HTTP/2 协议
✅ 配置了安全响应头
✅ 优化了 SSL 性能

现在只需重启 nginx 服务即可生效！
