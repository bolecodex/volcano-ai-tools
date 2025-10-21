# TOS 文件上传使用指南

## 前提条件

在使用数字人的本地文件上传功能之前，您需要完成以下配置：

### 1. 启动后端服务

确保后端服务正在运行：

```bash
cd backend
python main.py
```

您应该看到类似这样的输出：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. 配置 TOS（对象存储）

在前端应用中进入"设置"页面，配置以下信息：

#### TOS 配置
- **Bucket 名称**: 您的 TOS Bucket 名称（例如：`my-bucket`）
- **Region**: TOS 区域（例如：`cn-beijing`）
  - 常用区域：
    - `cn-beijing` - 华北（北京）
    - `cn-shanghai` - 华东（上海）
    - `cn-guangzhou` - 华南（广州）

#### 访问密钥
- **Access Key ID**: 您的火山引擎访问密钥 ID
- **Secret Access Key**: 您的火山引擎访问密钥密钥

### 3. 如何获取 TOS 配置

1. 登录 [火山引擎控制台](https://console.volcengine.com/)
2. 进入"对象存储 TOS"服务
3. 创建或选择一个 Bucket
4. 记录 Bucket 名称和所在区域
5. 在"访问管理" > "访问密钥"中获取 Access Key ID 和 Secret Access Key

## 使用步骤

### 1. 配置验证

在上传文件前，请确保所有配置都已正确填写。打开浏览器开发者工具（F12），查看控制台输出：

```
🔍 检查TOS配置: {
  hasTosConfig: true,
  bucket: 'my-bucket',
  region: 'cn-beijing',
  hasAccessKeyId: true,
  hasSecretAccessKey: true
}
```

如果任何值为 `false` 或 `(未配置)`，请返回设置页面完成配置。

### 2. 上传文件

1. 进入"数字人"页面
2. 选择"上传本地图片"或"上传本地音频"
3. 选择文件
4. 系统会自动上传到 TOS

### 3. 查看上传状态

在控制台中，您会看到上传进度：

**成功时：**
```
📤 准备上传文件: {fileName: 'test.jpg', fileSize: 102400, bucket: 'my-bucket', region: 'cn-beijing'}
✅ 上传成功: {success: true, url: 'https://...'}
```

**失败时：**
```
❌ 上传失败 (HTTP 422): {detail: [...]}
```

## 常见问题

### 问题 1: "TOS Bucket 未配置"

**错误信息：**
```
TOS Bucket 未配置。请在设置页面配置 TOS Bucket 名称。
```

**解决方法：**
1. 进入"设置"页面
2. 在"TOS 配置"部分填写 Bucket 名称
3. 点击保存

### 问题 2: "TOS Region 未配置"

**错误信息：**
```
TOS Region 未配置。请在设置页面配置 TOS Region（如：cn-beijing）。
```

**解决方法：**
1. 进入"设置"页面
2. 在"TOS 配置"部分填写 Region（如：`cn-beijing`）
3. 点击保存

### 问题 3: "AccessKeyId 未配置"

**错误信息：**
```
AccessKeyId 未配置。请在设置页面配置访问密钥。
```

**解决方法：**
1. 进入"设置"页面
2. 在"访问密钥"部分填写 Access Key ID
3. 点击保存

### 问题 4: 上传失败 - HTTP 422 错误

**错误信息：**
```
❌ 上传失败 (HTTP 422): {detail: Array(1)}
```

**可能原因：**
- Bucket 名称或 Region 配置错误
- 访问密钥不正确
- 配置中包含空格或特殊字符

**解决方法：**
1. 检查控制台输出，查看具体的错误信息
2. 返回设置页面，重新检查所有配置
3. 确保没有多余的空格
4. 确保 Region 格式正确（如：`cn-beijing`，不是 `北京`）

### 问题 5: 上传失败 - 网络错误

**错误信息：**
```
Failed to fetch
```

**可能原因：**
- 后端服务未启动
- 后端服务端口不正确

**解决方法：**
1. 检查后端服务是否正在运行：
   ```bash
   cd backend
   python main.py
   ```
2. 确认后端运行在 `http://localhost:8000`
3. 访问 `http://localhost:8000/api/tos/status` 检查服务状态

### 问题 6: 文件过大

**错误信息：**
```
文件大小超过100MB限制
```

**解决方法：**
- 压缩文件
- 或将文件上传到其他地方后使用 URL 方式

## 调试技巧

### 1. 检查后端日志

在后端终端中，您会看到：

```
📥 收到TOS上传请求:
  - 文件名: test.jpg
  - 内容类型: image/jpeg
  - Bucket: my-bucket
  - Region: cn-beijing
  - Access Key ID: AKLT...
  - Secret Key: ********************
```

### 2. 检查前端日志

在浏览器控制台中，您会看到：

```javascript
🔍 检查TOS配置: {...}
📤 准备上传文件: {...}
✅ 上传成功: {...}
```

### 3. 测试 TOS 服务

访问以下 URL 测试服务是否正常：
```
http://localhost:8000/api/tos/status
```

应该返回：
```json
{
  "status": "ok",
  "service": "TOS Upload Service",
  "version": "1.0.0"
}
```

## 安全提示

⚠️ **重要**: 
- 不要在公共环境中分享您的访问密钥
- 定期更换访问密钥
- 使用最小权限原则配置访问密钥
- 生产环境建议使用 HTTPS

## 支持的文件类型

### 图片
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)

### 音频
- MP3 (.mp3)
- WAV (.wav)
- AAC (.aac)
- M4A (.m4a)
- OGG (.ogg)

### 大小限制
- 单个文件最大 100MB
- 建议音频时长 < 35 秒（数字人要求）

## 技术支持

如果遇到其他问题，请：
1. 查看浏览器控制台的完整错误信息
2. 查看后端终端的日志输出
3. 参考 `backend/docs/TOS_WEB_UPLOAD.md` 技术文档




