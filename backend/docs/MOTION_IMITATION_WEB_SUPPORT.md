# 动作模仿 Web 浏览器支持

## 概述

本次更新为动作模仿功能添加了完整的 Web 浏览器支持，解决了之前"上传功能仅在桌面应用中可用"的错误。

## 问题描述

### 原始错误

```
MotionImitation.js:655 图片上传失败: Error: 上传功能仅在桌面应用中可用
```

### 原因分析

- 之前的实现只支持 Electron 桌面应用的 IPC 接口
- 在 Web 浏览器环境中，`window.electronAPI` 不存在
- 文件上传、任务提交、任务查询都依赖 Electron IPC

## 解决方案

### 1. 添加 TOS 文件上传的 HTTP API 支持

#### 后端改进

- **文件**: `backend/tos_routes.py`
- **功能**: 提供 `/api/tos/upload` HTTP 接口
- **说明**: 通过后端代理上传文件到火山引擎 TOS 对象存储

#### 前端改进

- **文件**: `frontend/src/api/volcanoAPI.js`
- **新增方法**: `uploadToTOS(file, tosConfig, accessKeyId, secretAccessKey)`
- **功能**: 通过 HTTP 请求上传文件到后端，再由后端转发到 TOS

#### 智能切换逻辑

`frontend/src/components/MotionImitation.js` 中的 `uploadFileToTOS` 函数：

```javascript
// 优先使用Electron IPC（如果可用）
if (window.electronAPI && window.electronAPI.uploadToTOS) {
  console.log('🖥️ 使用 Electron IPC 上传文件');
  // ... Electron 上传逻辑
} else {
  // 使用HTTP API上传（Web浏览器环境）
  console.log('🌐 使用 HTTP API 上传文件');
  const result = await volcanoAPI.uploadToTOS(file, tosConfig, accessKeyId, secretAccessKey);
  // ...
}
```

### 2. 添加动作模仿任务的 HTTP API 支持

#### 即梦动作模仿接口

**提交任务**:
- **方法**: `volcanoAPI.submitJimengMotionImitationTask(requestData)`
- **端点**: `POST /api/volcano/visual/CVSync2AsyncSubmitTask`
- **req_key**: `jimeng_imitator_ii2v`

**查询任务**:
- **方法**: `volcanoAPI.queryJimengMotionImitationTask(requestData)`
- **端点**: `POST /api/volcano/visual/CVSync2AsyncGetResult/query`
- **req_key**: `jimeng_imitator_ii2v`

#### 经典动作模仿接口

**提交任务**:
- **方法**: `volcanoAPI.submitMotionImitationTask(requestData)`
- **端点**: `POST /api/volcano/visual/CVSync2AsyncSubmitTask`
- **req_key**: `realman_avatar_imitator_v2v_gen_video`

**查询任务**:
- **方法**: `volcanoAPI.queryMotionImitationTask(requestData)`
- **端点**: `POST /api/volcano/visual/CVSync2AsyncGetResult/query`
- **req_key**: `realman_avatar_imitator_v2v_gen_video`

### 3. 依赖更新

在 `backend/requirements.txt` 中添加：

```
python-multipart==0.0.6
```

该依赖是 FastAPI 处理文件上传所必需的。

### 4. UI 说明更新

更新了 `MotionImitation.js` 中的使用说明，明确说明：

- ✅ 支持 URL 地址输入（推荐）
- ✅ 支持本地文件上传（Web 和 Electron 都支持）
- ✅ 需要先在设置中配置 TOS 存储桶信息

## 技术实现细节

### 智能环境检测

所有与外部服务交互的功能都采用了智能环境检测模式：

1. **检测 Electron 环境**: 检查 `window.electronAPI` 是否存在
2. **优先使用 IPC**: 如果在 Electron 环境，使用性能更好的 IPC 通信
3. **降级到 HTTP**: 如果在 Web 环境，使用 HTTP API 通信
4. **统一接口**: 两种方式返回相同的数据格式

### 文件上传流程

#### Web 浏览器环境

```
用户选择文件
  ↓
前端: FormData 封装
  ↓
HTTP POST → /api/tos/upload
  ↓
后端: 读取文件数据
  ↓
后端: 生成签名
  ↓
后端: PUT → TOS 对象存储
  ↓
返回: TOS 公网 URL
  ↓
前端: 使用 URL 提交任务
```

#### Electron 环境

```
用户选择文件
  ↓
前端: 读取为 ArrayBuffer
  ↓
IPC 传输到主进程
  ↓
主进程: 生成签名
  ↓
主进程: PUT → TOS 对象存储
  ↓
返回: TOS 公网 URL
  ↓
前端: 使用 URL 提交任务
```

### 认证机制

- **TOS 上传**: 使用 Signature V4 签名（AccessKey + SecretKey）
- **火山引擎 API**: 使用 Signature V4 签名（AccessKey + SecretKey）
- **传输安全**: 所有敏感信息通过请求头传输，不暴露在 URL 中

## 使用说明

### 前提条件

1. 在设置页面配置 **火山引擎 AccessKey** 和 **SecretAccessKey**
2. 如果使用本地文件上传，需要配置 **TOS Bucket** 和 **Region**

### 使用步骤

1. **选择输入方式**
   - **URL 地址**: 直接粘贴图片和视频的公网 URL
   - **本地文件**: 选择本地图片和视频文件（会自动上传到 TOS）

2. **提交任务**
   - 点击"开始生成动作模仿视频"按钮
   - 系统会自动选择合适的通信方式（IPC 或 HTTP）

3. **查看进度**
   - 切换到"任务列表"标签页
   - 点击"刷新状态"按钮查看任务进度
   - 任务完成后可以播放和下载视频

### 文件大小限制

- **图片**: ≤ 10MB (前端验证)
- **视频**: ≤ 100MB (后端限制，可在 `tos_routes.py` 中调整)

## 测试验证

### 验证步骤

1. **启动后端服务**
   ```bash
   cd backend
   python3 main.py
   ```

2. **启动前端服务**
   ```bash
   cd frontend
   npm start
   ```

3. **访问浏览器**
   - 打开 http://localhost:3000
   - 导航到"动作模仿"页面

4. **测试本地文件上传**
   - 选择"本地文件"输入方式
   - 上传一张图片和一个视频
   - 应该能看到上传进度和成功提示

5. **测试任务提交**
   - 点击"开始生成"
   - 应该成功提交任务并获得 task_id

6. **测试任务查询**
   - 等待 30 秒后，点击"刷新状态"
   - 应该能正常查询任务状态

## 兼容性

### 支持的环境

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Electron 桌面应用

### 不支持的环境

- ❌ IE 11 及以下版本
- ❌ 不支持 Fetch API 的旧浏览器

## 故障排查

### 问题: 文件上传失败 - "TOS配置不完整"

**原因**: 未配置 TOS 存储桶信息

**解决方案**:
1. 打开"设置"页面
2. 在"TOS 对象存储配置"部分填写:
   - Bucket 名称
   - Region (如: cn-beijing)
3. 保存配置

### 问题: 任务提交失败 - "401 Unauthorized"

**原因**: AccessKey 或 SecretKey 配置错误

**解决方案**:
1. 打开"设置"页面
2. 检查"API 凭证配置"中的:
   - AccessKeyId
   - SecretAccessKey
3. 确保这些密钥有访问视觉服务的权限

### 问题: 上传文件过大

**原因**: 文件超过大小限制

**解决方案**:
- 压缩图片或视频
- 或者使用 URL 方式，直接提供已上传到其他对象存储的文件 URL

## 安全建议

1. **不要在前端硬编码 AccessKey**: 始终从设置页面获取
2. **使用 HTTPS**: 生产环境必须使用 HTTPS 协议
3. **定期轮换密钥**: 建议定期更换 AccessKey 和 SecretKey
4. **限制 Bucket 权限**: TOS Bucket 应该只允许上传，不允许公开列举

## 后续优化建议

1. **添加上传进度条**: 显示文件上传的百分比
2. **支持断点续传**: 大文件上传失败后可以续传
3. **文件压缩**: 在上传前自动压缩图片和视频
4. **批量上传**: 支持一次选择多个文件
5. **预览功能**: 上传前预览图片和视频

## 相关文件

### 前端文件
- `frontend/src/components/MotionImitation.js` - 动作模仿组件
- `frontend/src/api/volcanoAPI.js` - API 客户端

### 后端文件
- `backend/tos_routes.py` - TOS 上传路由
- `backend/volcano_routes.py` - 火山引擎 API 路由
- `backend/volcano_api_service.py` - API 服务层
- `backend/signature_v4.py` - 签名生成器

### 配置文件
- `backend/requirements.txt` - Python 依赖

## 更新日期

2025-10-19

## 作者

AI Assistant



