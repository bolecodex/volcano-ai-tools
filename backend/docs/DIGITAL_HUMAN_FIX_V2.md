# 数字人组件 TOS 上传功能修复 (V2)

## 修复时间
2025-10-20（更新版本）

## 问题描述

升级后仍然出现错误：
```
⚠️ AccessKeyId 验证失败: {accessKeyId: undefined, type: 'undefined'}
❌ TOS上传异常: Error: AccessKeyId 未配置或无效，请在设置页面配置
```

即使已在设置页面配置了 AccessKeyId。

## 根本原因

在某些情况下，`storage.getAccessKeyId()` 可能返回空值，导致 volcanoAPI 无法获取凭证。

## 解决方案

### 参考 MotionImitation 的做法

在 MotionImitation 组件中已经实现了完整的后备逻辑，当 storage 工具返回空值时，直接从 localStorage 读取：

```javascript
// 如果 storage 返回空值，直接从 localStorage 读取
if (!accessKeyId || !secretAccessKey) {
  console.log('⚠️ storage 工具返回空值，直接从 localStorage 读取');
  accessKeyId = localStorage.getItem('volcengine_access_key_id') || '';
  secretAccessKey = localStorage.getItem('volcengine_secret_access_key') || '';
  
  // 同时重新读取 TOS 配置
  try {
    const tosConfigStr = localStorage.getItem('tos_config');
    if (tosConfigStr) {
      tosConfig = JSON.parse(tosConfigStr);
    }
  } catch (e) {
    console.error('解析 TOS 配置失败:', e);
  }
}
```

### DigitalHuman 的修复

现在 DigitalHuman 使用相同的方式：

1. **先尝试通过 storage 工具获取**
2. **如果失败，直接从 localStorage 读取**
3. **确保参数不为 undefined**
4. **调用 volcanoAPI.uploadToTOS**

## 调用流程

### 完整的参数获取流程

```
1. storage.getAccessKeyId() 
   ↓
2. 如果为空 → localStorage.getItem('volcengine_access_key_id')
   ↓
3. 传递给 volcanoAPI.uploadToTOS()
   ↓
4. volcanoAPI 验证参数
   ↓
5. 如果验证通过 → 通过 HTTP 上传到后端
   ↓
6. 后端 /api/tos/upload 处理
   ↓
7. 使用 Signature V4 上传到火山引擎 TOS
```

## 修改的文件

- `frontend/src/components/DigitalHuman.js`
  - 添加 localStorage 后备读取逻辑
  - 简化日志输出
  - 确保参数在任何情况下都不为 undefined

## 测试步骤

1. 刷新浏览器 (`F5`)
2. 进入数字人页面
3. 选择本地图片或音频
4. **查看控制台日志**：

```
🔍 检查TOS配置: {
  hasTosConfig: true,
  bucket: 'zhaoweibo-video-demo',
  region: 'cn-beijing',
  hasAccessKeyId: true,
  accessKeyIdLength: 20,
  hasSecretAccessKey: true,
  secretAccessKeyLength: 30
}

🌐 使用 HTTP API 上传文件
🔐 上传参数: {
  fileName: 'test.png',
  fileSize: 1601348,
  bucket: 'zhaoweibo-video-demo',
  region: 'cn-beijing',
  hasAccessKeyId: true,
  hasSecretAccessKey: true
}

🔍 验证上传参数: {...}
📤 开始上传文件到TOS: {...}
✅ TOS上传成功: {success: true, url: 'https://...'}
```

## 关键改进

- ✅ localStorage 后备机制
- ✅ 参数验证更严格
- ✅ 日志更清晰
- ✅ 与 MotionImitation 保持一致的实现方式

## 相关文档

- `frontend/docs/TOS_UPLOAD_GUIDE.md` - 用户使用指南
- `backend/docs/TOS_WEB_UPLOAD.md` - 技术实现文档
- `backend/docs/TOS_DEBUG.md` - 调试指南
- `backend/docs/DIGITAL_HUMAN_FIX.md` - 第一版修复说明



