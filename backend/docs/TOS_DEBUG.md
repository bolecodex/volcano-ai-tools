# TOS 上传错误调试指南

## 问题描述

当上传文件时出现错误：
```
❌ TOS上传异常: Error: AccessKeyId 未配置，请在设置页面配置
```

即使已经在设置页面配置了 AccessKeyId 和 SecretAccessKey。

## 问题根源

这个错误通常由以下几个原因引起：

### 1. **参数传递错误**
- AccessKeyId 或 SecretAccessKey 被传递为空字符串 `""`
- 被传递为 `null` 或 `undefined`
- 包含首尾空格

### 2. **参数类型错误**
- 参数不是字符串类型
- 参数被误传为其他类型

### 3. **API 调用路径错误**
- 前端调用了错误的 uploadToTOS 方法
- 参数顺序不匹配

## 调试步骤

### 步骤 1: 打开浏览器开发者工具

按 `F12` 打开开发者工具，切换到 "Console" (控制台) 标签。

### 步骤 2: 查看详细日志

当尝试上传文件时，您应该看到以下日志输出：

**正常情况：**
```javascript
🔍 检查TOS配置: {
  hasTosConfig: true,
  bucket: 'zhaoweibo-video-demo',
  region: 'cn-beijing',
  hasAccessKeyId: true,
  hasSecretAccessKey: true
}

📤 准备上传文件: {
  fileName: 'test.png',
  fileSize: 1601348,
  bucket: 'zhaoweibo-video-demo',
  region: 'cn-beijing'
}

✅ 上传成功: {success: true, url: 'https://...'}
```

**错误情况 - 配置检查失败：**
```javascript
🔍 检查TOS配置: {
  hasTosConfig: true,
  bucket: 'zhaoweibo-video-demo',
  region: 'cn-beijing',
  hasAccessKeyId: false,  // ← 问题在这里
  hasSecretAccessKey: true
}
```

## 常见问题及解决方案

### 问题 1: localStorage 数据检查

在浏览器控制台中运行：
```javascript
console.log({
  tosConfig: localStorage.getItem('tos_config'),
  accessKeyId: localStorage.getItem('access_key_id'),
  secretAccessKey: localStorage.getItem('secret_access_key')
});
```

### 问题 2: 手动测试 API

使用 curl 测试后端上传端点：
```bash
curl -X POST http://localhost:8000/api/tos/upload \
  -F "file=@/path/to/file.jpg" \
  -F "bucket=your-bucket-name" \
  -F "region=cn-beijing" \
  -F "access_key_id=YOUR_ACCESS_KEY_ID" \
  -F "secret_access_key=YOUR_SECRET_ACCESS_KEY"
```

## 故障排查检查清单

- [ ] 后端服务正在运行
- [ ] TOS 服务可达 (`http://localhost:8000/api/tos/status`)
- [ ] 设置页面已填写所有必需字段
- [ ] localStorage 中有正确的数据
- [ ] 访问密钥有 TOS 写入权限



