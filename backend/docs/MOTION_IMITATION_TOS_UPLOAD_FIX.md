# 动作模仿 TOS 上传修复

## 问题描述

在动作模仿功能中使用本地文件上传时，遇到以下错误：

```
volcanoAPI.js:1059 ⚠️ AccessKeyId 验证失败: 
{accessKeyId: undefined, type: 'undefined'}

volcanoAPI.js:1133 ❌ TOS上传异常: Error: AccessKeyId 未配置或无效

MotionImitation.js:730 图片上传失败: Error: 上传失败

MotionImitation.js:972 提交任务失败: Error: 上传失败
```

## 问题分析

对比即梦生图生视频（ImageGenerator）和数字人（DigitalHuman）的实现，发现动作模仿（MotionImitation）的 `uploadFileToTOS` 函数存在以下问题：

### 1. 复杂的配置读取逻辑

原代码使用了复杂的二次读取 localStorage 逻辑：

```javascript
// 获取TOS配置
let tosConfig = storage.getTOSConfig();
let accessKeyId = storage.getAccessKeyId();
let secretAccessKey = storage.getSecretAccessKey();

// 如果 storage 返回空值，直接从 localStorage 读取
if (!accessKeyId || !secretAccessKey) {
  console.log('⚠️ storage 工具返回空值，直接从 localStorage 读取');
  accessKeyId = localStorage.getItem('volcengine_access_key_id') || '';
  secretAccessKey = localStorage.getItem('volcengine_secret_access_key') || '';
  // ...
}
```

这种复杂的逻辑可能在某些边缘情况下导致变量未正确赋值。

### 2. 参数传递问题

在调用 `volcanoAPI.uploadToTOS` 时，可能传递了包含空格或格式不正确的参数。

### 3. 缺少参数校验

在传递参数前没有进行 `.trim()` 处理，可能导致空格字符串通过初步检查但在后续验证时失败。

## 解决方案

参考 DigitalHuman.js 的实现，对 `uploadFileToTOS` 函数进行了以下改进：

### 1. 简化配置读取逻辑

直接使用 storage 工具获取配置，去掉了复杂的二次读取逻辑：

```javascript
// 获取TOS配置和访问密钥
const tosConfig = storage.getTOSConfig();
const accessKeyId = storage.getAccessKeyId();
const secretAccessKey = storage.getSecretAccessKey();
```

### 2. 增强参数验证

添加了更严格的参数验证：

```javascript
if (!accessKeyId || accessKeyId.trim() === '') {
  throw new Error('AccessKeyId 未配置。\n\n请在设置页面的"API 凭证配置"中填写 AccessKeyId');
}
if (!secretAccessKey || secretAccessKey.trim() === '') {
  throw new Error('SecretAccessKey 未配置。\n\n请在设置页面的"API 凭证配置"中填写 SecretAccessKey');
}
```

### 3. 参数清理

在传递参数时使用 `.trim()` 清理空格：

```javascript
// Electron IPC 环境
const config = {
  ...tosConfig,
  accessKeyId: accessKeyId.trim(),
  secretAccessKey: secretAccessKey.trim()
};

// Web 环境
const result = await volcanoAPI.uploadToTOS(
  file, 
  tosConfig, 
  accessKeyId.trim(), 
  secretAccessKey.trim()
);
```

### 4. 增强日志输出

添加了更详细的日志，便于调试：

```javascript
console.log('✅ 配置检查通过，开始上传文件...');
console.log('📤 调用参数:', {
  fileName: file.name,
  tosConfigBucket: tosConfig.bucket,
  tosConfigRegion: tosConfig.region,
  accessKeyIdProvided: !!accessKeyId,
  secretAccessKeyProvided: !!secretAccessKey
});
```

## 修改文件

- `frontend/src/components/MotionImitation.js` - 修复了 `uploadFileToTOS` 函数

## 使用说明

### 前提条件

在使用本地文件上传功能前，需要在设置页面配置以下信息：

1. **API 凭证配置**
   - AccessKeyId
   - SecretAccessKey

2. **TOS 对象存储配置**
   - Bucket 名称
   - Region（如：cn-beijing）

### 使用步骤

1. 点击左侧菜单的 "Settings"
2. 在 "API 凭证配置" 中填写 AccessKeyId 和 SecretAccessKey
3. 在 "TOS 对象存储配置" 中填写 Bucket 和 Region
4. 点击 "保存" 按钮
5. 返回动作模仿页面，选择本地文件上传

## 参考实现

本次修复参考了以下组件的实现：

- `frontend/src/components/ImageGenerator.js` - 即梦生图生视频
- `frontend/src/components/DigitalHuman.js` - 数字人视频生成

这些组件都使用了类似的 TOS 上传逻辑，经过验证运行稳定。

## 测试建议

1. **正常流程测试**
   - 配置完整的 TOS 信息和 AccessKey
   - 上传图片和视频文件
   - 验证上传成功并能正常提交任务

2. **异常流程测试**
   - 未配置 AccessKey 时的错误提示
   - 未配置 TOS Bucket 时的错误提示
   - 未配置 TOS Region 时的错误提示

3. **边界条件测试**
   - AccessKey 包含前后空格
   - 文件名包含特殊字符
   - 大文件上传（接近10MB限制）

## 预期效果

修复后，动作模仿功能的本地文件上传应该能够：

1. ✅ 正确读取 storage 中的配置信息
2. ✅ 正确验证 AccessKeyId 和 SecretAccessKey
3. ✅ 成功上传文件到 TOS
4. ✅ 获取文件 URL 并提交任务
5. ✅ 提供清晰的错误提示

## 注意事项

1. **AccessKey 权限**：确保 AccessKey 具有 TOS 上传权限
2. **TOS Bucket 权限**：确保 Bucket 已正确配置访问权限
3. **文件大小限制**：图片≤10MB，视频≤10MB（建议）
4. **网络环境**：确保能够访问火山引擎 TOS 服务

## 相关文档

- [TOS_UPLOAD_GUIDE.md](../../frontend/docs/TOS_UPLOAD_GUIDE.md) - TOS 上传使用指南
- [TOS_CONFIG_GUIDE.md](TOS_CONFIG_GUIDE.md) - TOS 配置指南
- [MOTION_IMITATION_WEB_SUPPORT.md](MOTION_IMITATION_WEB_SUPPORT.md) - 动作模仿Web支持说明

---

**修复日期**: 2025-10-20  
**修复版本**: v1.0.1  
**修复人员**: AI Assistant



