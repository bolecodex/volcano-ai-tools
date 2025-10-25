# 域名配置说明

## 概述

本文档说明了如何配置 `www.hs-ai.top` 域名以正确访问前端页面和后端API。

## 配置内容

### 1. Nginx 配置

域名配置文件位于：`/etc/nginx/sites-available/hs-ai.top`

**关键配置点：**

- **前端访问**：`location /` 代理到 `http://127.0.0.1:3000`
- **API访问**：`location /api/` 代理到 `http://127.0.0.1:8000/`（注意末尾的斜杠）

```nginx
# 前端静态文件
location / {
    proxy_pass http://127.0.0.1:3000;
    # ... 其他配置
}

# 后端 API（重要：proxy_pass 末尾必须有斜杠）
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    # ... 其他配置
}
```

**重要说明：** `proxy_pass` 末尾的斜杠很关键：
- `proxy_pass http://127.0.0.1:8000/;` - 会去掉 `/api` 前缀，将 `/api/health` 转发为 `/health`
- `proxy_pass http://127.0.0.1:8000;` - 会保留完整路径，将 `/api/health` 转发为 `/api/health`

### 2. 前端配置

**文件位置：** `frontend/src/config.js`

```javascript
// API配置
// 使用相对路径，通过nginx代理访问后端API
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
```

**说明：** 使用相对路径 `/api` 而不是硬编码的IP地址，这样前端的API请求会自动使用当前域名。

### 3. Webpack 配置

**文件位置：** `frontend/webpack.config.js`

```javascript
devServer: {
    // ... 其他配置
    allowedHosts: 'all'  // 允许所有域名访问
}
```

**说明：** 添加 `allowedHosts: 'all'` 以允许通过域名访问webpack dev server，避免 "Invalid Host header" 错误。

## 访问方式

### 前端页面
```bash
http://www.hs-ai.top/
```

### API接口
```bash
http://www.hs-ai.top/api/health
http://www.hs-ai.top/api/docs
http://www.hs-ai.top/api/
```

## 测试验证

### 1. 测试前端访问
```bash
curl -I http://www.hs-ai.top/
# 应该返回 200 OK 和 HTML 内容
```

### 2. 测试API访问
```bash
# 健康检查
curl http://www.hs-ai.top/api/health
# 应该返回: {"status":"healthy"}

# API根路径
curl http://www.hs-ai.top/api/
# 应该返回: {"message":"欢迎使用 火山AI工具 API","version":"1.0.0","status":"运行中"}

# API文档
curl -I http://www.hs-ai.top/api/docs
# 应该返回 200 OK
```

## 配置修改后的操作

### 修改 Nginx 配置后
```bash
# 测试配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx
```

### 修改前端配置后
```bash
# 停止前端服务
ps aux | grep webpack | grep -v grep | awk '{print $2}' | xargs kill -9

# 重新启动前端服务
cd /root/volcano-ai-tools
bash start-frontend.sh
```

## 故障排查

### 问题1：前端返回 "Invalid Host header"
**原因：** Webpack dev server 默认只允许 localhost 访问

**解决方案：** 在 `webpack.config.js` 中添加 `allowedHosts: 'all'`

### 问题2：API 返回 404
**原因：** Nginx 的 `proxy_pass` 配置不正确

**解决方案：** 确保 `proxy_pass http://127.0.0.1:8000/;` 末尾有斜杠

### 问题3：前端API请求失败
**原因：** 前端配置使用了硬编码的IP地址

**解决方案：** 修改 `frontend/src/config.js` 使用相对路径 `/api`

## 架构说明

```
用户请求 → Nginx (80端口)
         ├─ / → Webpack Dev Server (3000端口) → 前端页面
         └─ /api/ → FastAPI Backend (8000端口) → 后端API
```

所有请求都通过域名 `www.hs-ai.top` 的80端口进入，由Nginx根据路径分发到相应的服务。

## 更新日期

2025-10-25
