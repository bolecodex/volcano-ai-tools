# 修复硬编码IP地址问题

## 问题描述

用户访问 `http://www.hs-ai.top/` 时遇到以下错误：

1. `GET http://www.hs-ai.top/favicon.ico 404 (Not Found)`
2. `API连接错误: AxiosError - Network Error`
3. `GET http://115.190.200.62:8000/ net::ERR_CONNECTION_REFUSED`

## 根本原因

前端代码中多个文件使用了硬编码的IP地址 `http://115.190.200.62:8000`，导致：
- 前端尝试直接连接旧IP地址而不是通过nginx代理
- 跨域请求失败
- API连接错误

## 修复内容

### 1. 统一使用配置文件

修改了以下文件，将硬编码的IP地址改为从 `config.js` 导入：

#### 修改的文件列表：

1. **frontend/src/App.js**
   ```javascript
   // 修改前
   const API_BASE_URL = 'http://115.190.200.62:8000';
   
   // 修改后
   import { API_BASE_URL } from './config';
   ```

2. **frontend/src/components/Login.js**
   ```javascript
   // 修改前
   const API_BASE_URL = 'http://115.190.200.62:8000';
   
   // 修改后
   import { API_BASE_URL } from '../config';
   ```

3. **frontend/src/components/Register.js**
   ```javascript
   // 修改前
   const API_BASE_URL = 'http://115.190.200.62:8000';
   
   // 修改后
   import { API_BASE_URL } from '../config';
   ```

4. **frontend/src/components/SystemConfig.js**
   ```javascript
   // 修改前
   const API_BASE_URL = 'http://115.190.200.62:8000';
   
   // 修改后
   import { API_BASE_URL } from '../config';
   ```

5. **frontend/src/api/volcanoAPI.js**
   ```javascript
   // 修改前
   const API_BASE_URL = 'http://115.190.200.62:8000';
   
   // 修改后
   import { API_BASE_URL } from '../config';
   ```

### 2. 配置文件内容

**frontend/src/config.js** 已正确配置为使用相对路径：

```javascript
// API配置
// 使用相对路径，通过nginx代理访问后端API
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// 认证配置
export const TOKEN_KEY = 'token';

// 获取认证头
export const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
```

### 3. 修复Favicon问题

在 `frontend/public/index.html` 中添加了内联SVG favicon：

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌋</text></svg>">
```

这样可以避免额外的HTTP请求和404错误。

### 4. Webpack配置

**修复 process.env 错误：**

在 `frontend/webpack.config.js` 中添加了 `webpack.DefinePlugin` 来处理环境变量：

```javascript
const webpack = require('webpack');

module.exports = {
  // ... 其他配置
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body'
    }),
    // 添加 DefinePlugin 来定义环境变量
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || '/api')
    })
  ],
  devServer: {
    // ... 其他配置
    allowedHosts: 'all'  // 允许所有域名访问
  }
};
```

**说明：** 
- `DefinePlugin` 会在编译时将 `process.env.REACT_APP_API_URL` 替换为实际的值
- 这样可以避免浏览器中的 "process is not defined" 错误
- 如果没有设置环境变量，默认使用 `/api`

## 部署步骤

### 1. 清理缓存并重启前端服务

```bash
# 停止前端服务
ps aux | grep webpack | grep -v grep | awk '{print $2}' | xargs kill -9

# 清理webpack缓存
cd /root/volcano-ai-tools/frontend
rm -rf node_modules/.cache

# 重新启动前端服务
cd /root/volcano-ai-tools
bash start-frontend.sh
```

### 2. 重新加载Nginx（如果修改了配置）

```bash
# 测试配置
sudo nginx -t

# 重新加载
sudo systemctl reload nginx
```

## 验收测试

### 测试命令

```bash
# 1. 测试前端页面访问
curl -I http://www.hs-ai.top/
# 应返回: 200 OK

# 2. 测试API健康检查
curl http://www.hs-ai.top/api/health
# 应返回: {"status":"healthy"}

# 3. 测试API根路径
curl http://www.hs-ai.top/api/
# 应返回: {"message":"欢迎使用 火山AI工具 API","version":"1.0.0","status":"运行中"}

# 4. 检查是否还有旧IP地址
curl -s http://www.hs-ai.top/ | grep -o "115.190.200.62" | wc -l
# 应返回: 0

# 5. 检查bundle文件中是否有旧IP
curl -s http://www.hs-ai.top/bundle.*.js | grep -o "115.190.200.62" | wc -l
# 应返回: 0
```

### 测试结果

```
=== 综合验收测试 ===

✅ 1. 前端页面访问测试
   状态码: 200

✅ 2. API健康检查
   响应: {"status":"healthy"}

✅ 3. API根路径
   响应: {"message":"欢迎使用 火山AI工具 API","version":"1.0.0","status":"运行中"}

✅ 4. Favicon配置
   已在HTML中使用内联SVG

✅ 5. 旧IP地址检查
   HTML中旧IP数量: 0
   Bundle中旧IP数量: 0

=== 所有测试通过 ===
```

## 架构说明

修复后的请求流程：

```
用户浏览器
    ↓
http://www.hs-ai.top
    ↓
Nginx (80端口)
    ├─ / → Webpack Dev Server (3000端口)
    │      ↓
    │   前端页面（使用相对路径 /api）
    │      ↓
    └─ /api/ → FastAPI Backend (8000端口)
           ↓
        后端API响应
```

**关键点：**
- 前端使用相对路径 `/api` 发起请求
- 所有请求都通过同一域名，避免跨域问题
- Nginx负责路由分发

## 预防措施

为避免将来出现类似问题：

1. **代码审查**：在代码审查时检查是否有硬编码的IP地址或URL
2. **使用环境变量**：所有环境相关的配置都应使用环境变量或配置文件
3. **统一配置管理**：创建统一的配置文件（如 `config.js`），所有模块从这里导入配置
4. **文档更新**：在开发文档中明确说明不应硬编码IP地址

## 相关文件

- `frontend/src/config.js` - 统一配置文件
- `frontend/src/App.js` - 主应用组件
- `frontend/src/components/Login.js` - 登录组件
- `frontend/src/components/Register.js` - 注册组件
- `frontend/src/components/SystemConfig.js` - 系统配置组件
- `frontend/src/api/volcanoAPI.js` - API客户端
- `frontend/public/index.html` - HTML模板
- `frontend/webpack.config.js` - Webpack配置
- `/etc/nginx/sites-available/hs-ai.top` - Nginx配置

## 更新日期

2025-10-25

## 修复人员

AI Assistant
