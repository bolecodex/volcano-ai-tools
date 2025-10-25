# Nginx HTTP 域名配置完成

## ✅ 配置状态

域名 `www.hs-ai.top` 已成功配置并运行！

### 服务信息

- **域名**: www.hs-ai.top / hs-ai.top
- **协议**: HTTP
- **服务器 IP**: 150.5.161.140
- **前端端口**: 3000
- **后端端口**: 8000
- **Nginx 端口**: 80

### 访问地址

- 主页: http://www.hs-ai.top
- API: http://www.hs-ai.top/api/
- 健康检查: http://www.hs-ai.top/health

## 📋 当前配置

### Nginx 配置文件

位置: `/etc/nginx/sites-available/hs-ai.top`

主要配置：
- 监听 80 端口
- 前端请求代理到 localhost:3000
- API 请求代理到 localhost:8000
- 静态资源缓存优化
- Gzip 压缩

### 服务状态

```bash
# Nginx: ✅ 运行中 (端口 80)
# 后端: ✅ 运行中 (端口 8000)
# 前端: ✅ 运行中 (端口 3000)
```

## 🔧 常用命令

### 查看服务状态

```bash
# 查看 nginx 状态
sudo systemctl status nginx

# 查看端口占用
sudo netstat -tlnp | grep -E ':(80|3000|8000)'

# 测试域名访问
curl -I http://www.hs-ai.top

# 测试健康检查
curl http://www.hs-ai.top/health
```

### 重启服务

```bash
# 重启 nginx
sudo systemctl restart nginx

# 重新加载配置（无停机）
sudo nginx -s reload

# 测试配置
sudo nginx -t
```

### 查看日志

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

## 🎯 DNS 配置

请确保在域名服务商处添加了 A 记录：

```
主机记录: www
记录类型: A
记录值: 150.5.161.140
TTL: 600
```

可选：添加根域名记录
```
主机记录: @
记录类型: A
记录值: 150.5.161.140
TTL: 600
```

## 📊 性能优化

已启用的优化：

1. ✅ Gzip 压缩 - 自动压缩文本资源
2. ✅ 静态资源缓存 - 1年缓存期
3. ✅ 连接保持 - 优化的 keepalive 设置
4. ✅ 代理超时 - 60秒超时设置

## 🐛 故障排查

### 问题：域名无法访问

检查步骤：
```bash
# 1. 检查 DNS 解析
dig www.hs-ai.top

# 2. 检查 nginx 状态
sudo systemctl status nginx

# 3. 检查端口
sudo netstat -tlnp | grep :80

# 4. 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题：502 Bad Gateway

检查后端服务：
```bash
# 检查后端
curl http://localhost:8000/health

# 检查前端
curl http://localhost:3000

# 重启服务
cd /root/volcano-ai-tools
./start-backend.sh
./start-frontend.sh
```

## 📝 配置文件位置

- Nginx 站点配置: `/etc/nginx/sites-available/hs-ai.top`
- Nginx 启用链接: `/etc/nginx/sites-enabled/hs-ai.top`
- 访问日志: `/var/log/nginx/access.log`
- 错误日志: `/var/log/nginx/error.log`

## 🚀 后续优化建议

如果需要更高的安全性和性能，可以考虑：

1. **配置 SSL/HTTPS** - 使用 Let's Encrypt 免费证书
2. **启用 HTTP/2** - 提升性能
3. **配置 CDN** - 加速静态资源访问
4. **启用防火墙** - 增强安全性
5. **配置日志轮转** - 防止日志文件过大

---

**配置完成时间**: 2025-10-25  
**状态**: ✅ 运行正常
