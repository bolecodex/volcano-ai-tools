# AI视频生成 500 错误修复指南

## 问题描述

在使用视频生成功能时遇到 500 内部服务器错误：
```
POST http://localhost:8000/api/volcano/video/create 500 (Internal Server Error)
```

## 错误原因

经过诊断，发现实际错误是：
```json
{
  "error": {
    "code": "AuthenticationError",
    "message": "The API key format is incorrect"
  }
}
```

这表明火山方舟 API Key 格式不正确或无效。

## 解决方案

### 1. 检查 API Key 是否正确配置

API Key 应该从火山方舟控制台获取，格式通常为：
- 以特定前缀开头的长字符串
- 不包含空格或特殊字符
- 区分大小写

### 2. 验证 API Key 的有效性

在设置页面：
1. 点击"火山方舟设置"
2. 输入从火山方舟控制台获取的 API Key
3. 点击"测试连接"按钮验证

### 3. 确认模型访问权限

确保您的 API Key 有权限访问所选模型：
- `doubao-seedance-1-0-lite-t2v` - 文生视频（轻量版）
- `doubao-seedance-1-0-pro-250528` - 文生视频和图生视频（专业版）

### 4. 检查 API Key 配置位置

API Key 需要在以下位置配置：
- 前端：通过设置页面配置
- 本地存储：保存在 localStorage 中（Web）或 Electron Store 中（桌面应用）

## 如何获取正确的 API Key

1. 访问 [火山方舟控制台](https://console.volcengine.com/ark)
2. 登录您的账号
3. 进入"API 密钥"或"接入管理"页面
4. 创建或复制现有的 API Key
5. 确保 API Key 有视频生成模型的访问权限

## 测试 API Key

使用以下命令测试 API Key 是否有效：

```bash
curl -X POST https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "doubao-seedream-4-0-250828",
    "prompt": "test",
    "size": "2K"
  }'
```

如果返回 401 错误，说明 API Key 无效。

## 常见错误

### 1. API Key 格式错误
- **症状**：返回 401 AuthenticationError
- **解决**：重新从控制台复制 API Key，确保没有多余的空格

### 2. API Key 权限不足
- **症状**：返回 403 或 "model does not exist" 错误
- **解决**：在控制台为 API Key 开通相应模型的访问权限

### 3. API Key 过期
- **症状**：之前能用，现在返回 401
- **解决**：在控制台检查 API Key 状态，必要时重新生成

## 调试建议

1. **查看后端日志**：
   ```bash
   tail -f backend/backend.log
   ```

2. **测试 API 连接**：
   在应用的设置页面，使用"测试连接"功能

3. **使用浏览器开发者工具**：
   - 打开 Network 标签
   - 查看请求详情
   - 检查 Authorization 头是否正确

## 临时解决方案

如果问题仍未解决，可以尝试：

1. **使用即梦 3.0 Pro 模型**（需要配置 Access Key）：
   - 在视频生成页面选择"即梦视频 3.0 Pro"模型
   - 配置 Access Key ID 和 Secret Access Key（而非 API Key）

2. **联系技术支持**：
   - 提供完整的错误信息
   - 提供 API Key 的前缀（不要提供完整的 Key）
   - 说明您尝试的解决步骤

## 更新日期

2025-10-21

