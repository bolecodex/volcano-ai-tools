# 数字人组件 TOS 上传功能修复

## 修复时间
2025-10-20

## 问题描述

数字人组件中的本地文件上传功能无法正常工作，出现错误：
```
❌ TOS上传异常: Error: AccessKeyId 未配置或无效，请在设置页面配置
```

错误堆栈显示 `accessKeyId: undefined`。

## 根本原因

DigitalHuman 组件没有导入 `volcanoAPI`，导致无法使用 volcanoAPI 的 `uploadToTOS` 方法。

## 解决方案

### 1. 导入 volcanoAPI

在 DigitalHuman.js 顶部添加导入：
```javascript
import volcanoAPI from '../api/volcanoAPI';
```

### 2. 使用 volcanoAPI.uploadToTOS

参考其他组件（如 MotionImitation）的做法，在 Web 环境中调用：
```javascript
const result = await volcanoAPI.uploadToTOS(file, tosConfig, accessKeyId, secretAccessKey);

if (result.success) {
  showAlert('success', `${type === 'image' ? '图片' : '音频'}上传成功！`);
  return result.url;
} else {
  throw new Error(result.error || '上传失败');
}
```

### 3. 改进 volcanoAPI 的参数验证

volcanoAPI.js 中的 uploadToTOS 方法现在有更好的参数验证：
- 检查参数类型
- 检查字符串是否为空
- 提供详细的错误信息

## 修改的文件

### 前端
- `frontend/src/components/DigitalHuman.js`
  - 添加 `import volcanoAPI from '../api/volcanoAPI'`
  - 修改 Web 环境下的文件上传使用 `volcanoAPI.uploadToTOS`

### 后端
- `frontend/src/api/volcanoAPI.js`
  - 改进参数验证逻辑
  - 添加类型检查
  - 添加详细的日志信息

## 调用流程

### Electron 环境
1. DigitalHuman 检测到 `window.electronAPI` 存在
2. 使用 Electron IPC 调用 `window.electronAPI.uploadToTOS`

### Web 环境
1. DigitalHuman 检测到 `window.electronAPI` 不存在
2. 使用 `volcanoAPI.uploadToTOS(file, tosConfig, accessKeyId, secretAccessKey)`
3. volcanoAPI 通过 HTTP 调用后端的 `/api/tos/upload` 端点
4. 后端通过 Signature V4 签名上传到火山引擎 TOS

## 使用步骤

1. **配置 TOS 信息**（在设置页面）
   - TOS Bucket 名称
   - TOS Region（如：cn-beijing）
   - Access Key ID
   - Secret Access Key

2. **上传文件**
   - 进入数字人页面
   - 选择本地图片或音频
   - 系统自动上传到 TOS

3. **查看日志**（F12 打开开发者工具）
   ```
   🔍 检查TOS配置: {...}
   📤 准备通过 volcanoAPI 上传文件: {...}
   ✅ 上传成功: {success: true, url: 'https://...'}
   ```

## 验证

确保以下工作正常：

- [x] Web 环境中的图片上传
- [x] Web 环境中的音频上传
- [x] Electron 环境中的文件上传（使用 IPC）
- [x] 错误处理和用户提示
- [x] 详细的日志输出

## 相关文档

- `frontend/docs/TOS_UPLOAD_GUIDE.md` - 用户使用指南
- `backend/docs/TOS_WEB_UPLOAD.md` - 技术实现文档
- `backend/docs/TOS_DEBUG.md` - 调试指南
