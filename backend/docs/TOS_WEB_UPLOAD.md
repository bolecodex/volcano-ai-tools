# TOS 文件上传功能 - Web 版本支持

## 更新时间
2025-10-19

## 问题背景

Web 版本应用无法使用 Electron 的 IPC 通信功能，导致数字人组件中的本地文件上传功能不可用，出现错误：
```
图片上传失败: window.electronAPI.uploadToTOS is not a function
```

## 解决方案

为 Web 版本添加后端 HTTP API 支持文件上传到 TOS，同时保持 Electron 版本的 IPC 通信方式。

## 实现内容

### 1. 后端实现

#### 新增文件：`backend/tos_routes.py`

创建了 TOS 文件上传路由，提供以下功能：

- **路由路径**: `POST /api/tos/upload`
- **功能**: 接收文件上传请求，将文件上传到火山引擎 TOS
- **请求参数**:
  - `file`: 要上传的文件（multipart/form-data）
  - `bucket`: TOS Bucket 名称
  - `region`: TOS 区域（如：cn-beijing）
  - `access_key_id`: 访问密钥 ID
  - `secret_access_key`: 访问密钥密钥

- **返回格式**:
  ```json
  {
    "success": true,
    "url": "https://bucket-name.tos-cn-beijing.volces.com/uploads/20251019_123456_abc123.jpg"
  }
  ```

- **文件限制**: 单个文件最大 100MB

#### 关键特性

1. **唯一文件名生成**: 使用时间戳和 MD5 哈希确保文件名唯一
2. **签名认证**: 使用 Signature V4 签名保证上传安全
3. **错误处理**: 完善的错误处理和日志记录
4. **异步支持**: 使用 httpx 异步客户端上传文件

### 2. 前端实现

#### 修改文件：`frontend/src/components/DigitalHuman.js`

主要改动：

1. **环境检测**:
   ```javascript
   const isElectron = window.electronAPI && window.electronAPI.uploadToTOS;
   ```

2. **双模式上传**:
   - **Electron 环境**: 继续使用 IPC 通信 `window.electronAPI.uploadToTOS`
   - **Web 环境**: 使用 HTTP API `POST /api/tos/upload`

3. **Web 上传实现**:
   ```javascript
   const formData = new FormData();
   formData.append('file', file);
   formData.append('bucket', tosConfig.bucket);
   formData.append('region', tosConfig.region || 'cn-beijing');
   formData.append('access_key_id', accessKeyId);
   formData.append('secret_access_key', secretAccessKey);
   
   const response = await fetch('http://localhost:8000/api/tos/upload', {
     method: 'POST',
     body: formData
   });
   ```

4. **用户提示**: 在使用说明中显示当前环境的上传方式

### 3. 路由注册

在 `backend/main.py` 中注册 TOS 路由：
```python
from tos_routes import router as tos_router
app.include_router(tos_router)
```

## 使用方法

### 前置条件

1. **启动后端服务**:
   ```bash
   cd backend
   python main.py
   # 或使用启动脚本
   ./start-backend.sh
   ```

2. **配置 TOS 信息**:
   - 在"设置"页面配置：
     - TOS Bucket 名称
     - TOS Region（如：cn-beijing）
     - Access Key ID
     - Secret Access Key

### Web 版本使用

1. 启动前端开发服务器：
   ```bash
   cd frontend
   npm start
   ```

2. 在数字人页面选择"上传本地图片"或"上传本地音频"

3. 选择文件后，系统会自动通过后端 API 上传到 TOS

### Electron 版本使用

Electron 版本的上传方式保持不变，继续使用 IPC 通信。

## API 安全性

### 密钥处理

- 前端从 localStorage 读取配置
- 每次上传请求都需要提供完整的认证信息
- 密钥仅在上传请求中传递，不会持久化在后端

### 建议

在生产环境中，建议：
1. 使用 HTTPS 加密传输
2. 实现用户认证机制
3. 限制上传文件大小和类型
4. 添加频率限制防止滥用

## 文件存储路径

上传的文件将存储在 TOS 的以下路径：
```
uploads/{timestamp}_{hash}{extension}
```

例如：
```
uploads/20251019_123456_abc123def.jpg
uploads/20251019_123500_xyz789.mp3
```

## 错误处理

常见错误及解决方法：

1. **TOS配置不完整**:
   - 检查设置页面是否已配置 Bucket、Region 和访问密钥

2. **文件大小超限**:
   - Web 版本限制单个文件 100MB
   - 检查文件大小是否符合要求

3. **网络错误**:
   - 确认后端服务正在运行
   - 检查后端地址是否正确（默认 localhost:8000）

4. **权限错误**:
   - 检查 Access Key 是否有 TOS 写入权限
   - 确认 Bucket 名称和 Region 是否正确

## 兼容性

### 支持环境

- ✅ Web 浏览器（通过后端 API）
- ✅ Electron 桌面应用（通过 IPC）

### 浏览器要求

- 支持 FormData API
- 支持 Fetch API
- 推荐使用现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）

## 相关文件

### 后端
- `backend/tos_routes.py` - TOS 上传路由
- `backend/signature_v4.py` - 签名生成器
- `backend/main.py` - 主应用入口

### 前端
- `frontend/src/components/DigitalHuman.js` - 数字人组件
- `frontend/src/utils/storage.js` - 配置存储工具

## 测试建议

1. **Web 环境测试**:
   - 启动后端和前端服务
   - 在数字人页面上传图片和音频
   - 检查文件是否成功上传到 TOS
   - 验证返回的 URL 是否可访问

2. **Electron 环境测试**:
   - 启动 Electron 应用
   - 测试文件上传功能
   - 确认仍然使用 IPC 方式上传

3. **错误场景测试**:
   - 测试配置缺失的情况
   - 测试超大文件上传
   - 测试网络错误情况

## 后续优化建议

1. **进度显示**: 添加上传进度条
2. **并发上传**: 支持多文件同时上传
3. **断点续传**: 支持大文件断点续传
4. **缓存优化**: 避免重复上传相同文件
5. **CDN 加速**: 配置 TOS CDN 加速访问

## 更新日志

- 2025-10-19: 初始版本，支持 Web 版本通过 HTTP API 上传文件到 TOS



