# 配置调试指南

## 问题：提示 "AccessKeyId 未配置"

即使你已经在设置页面配置了 AK/SK，仍然可能出现这个错误。

## 🔍 快速诊断

### 步骤 1: 打开浏览器控制台

1. 按 `F12` 或 `Cmd+Option+I`（Mac）打开开发者工具
2. 切换到 **Console** 标签页

### 步骤 2: 检查配置是否保存成功

在控制台中粘贴并运行以下代码：

```javascript
// 检查 AccessKey 配置
const accessKeyId = localStorage.getItem('volcengine_access_key_id');
const secretAccessKey = localStorage.getItem('volcengine_secret_access_key');

console.log('=== 配置检查 ===');
console.log('AccessKeyId:', accessKeyId ? `已配置 (长度: ${accessKeyId.length})` : '❌ 未配置');
console.log('SecretAccessKey:', secretAccessKey ? `已配置 (长度: ${secretAccessKey.length})` : '❌ 未配置');

// 检查 TOS 配置
const tosConfig = localStorage.getItem('tos_config');
console.log('TOS Config:', tosConfig ? JSON.parse(tosConfig) : '❌ 未配置');
```

### 步骤 3: 根据结果判断

#### 情况 A: 显示 "❌ 未配置"

**原因**: 配置没有保存成功

**解决方案**:
1. 重新打开 Settings 页面
2. 再次填写 AK/SK 和 TOS 配置
3. **确保点击了"保存"按钮**
4. 看到成功提示后，刷新页面（F5）

#### 情况 B: 显示 "已配置"，但仍然报错

**原因**: 页面缓存问题

**解决方案**:
1. **强制刷新页面**: `Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac)
2. 或者清空缓存后刷新：
   - 打开开发者工具 (F12)
   - 右键点击刷新按钮
   - 选择"清空缓存并硬性重新加载"

### 步骤 4: 手动设置配置（临时解决）

如果以上方法都不行，可以在控制台中手动设置：

```javascript
// 替换为你的实际配置
localStorage.setItem('volcengine_access_key_id', '你的AccessKeyId');
localStorage.setItem('volcengine_secret_access_key', '你的SecretAccessKey');
localStorage.setItem('tos_config', JSON.stringify({
  bucket: '你的Bucket名称',
  region: 'cn-beijing',  // 或其他地域
  endpoint: ''
}));

console.log('✅ 配置已手动设置，请刷新页面');
```

然后刷新页面（F5）。

## 🐛 深度调试

如果问题依然存在，在上传文件前在控制台运行：

```javascript
// 导入 storage 工具
import { storage } from './utils/storage.js';

// 检查 storage 读取
console.log('Storage 读取测试:');
console.log('getAccessKeyId():', storage.getAccessKeyId());
console.log('getSecretAccessKey():', storage.getSecretAccessKey());
console.log('getTOSConfig():', storage.getTOSConfig());
```

## 🔧 Settings 页面检查

确保你的 Settings 页面有正确的保存逻辑：

1. 打开 `frontend/src/components/Settings.js`（或类似文件）
2. 检查是否调用了 `storage.setAccessKeys()` 和 `storage.setTOSConfig()`
3. 检查是否有保存成功的提示

## 📝 预期的配置值示例

```javascript
{
  "volcengine_access_key_id": "AKLT***************************",
  "volcengine_secret_access_key": "************************************",
  "tos_config": {
    "bucket": "my-bucket-name",
    "region": "cn-beijing",
    "endpoint": ""
  }
}
```

## ⚡ 快速修复命令

如果你确定配置正确但就是不工作，执行以下步骤：

### 方法 1: 强制刷新
```
Ctrl+Shift+Delete (打开清除浏览数据) → 清除缓存 → 刷新页面
```

### 方法 2: 使用无痕模式测试
```
Ctrl+Shift+N (Chrome) 或 Cmd+Shift+P (Firefox)
重新登录并配置，测试是否工作
```

### 方法 3: 检查浏览器存储
```
F12 → Application 标签 → Local Storage → http://localhost:3000
查看是否有 volcengine_access_key_id 等键
```

## 🎯 终极解决方案

如果以上都不行，很可能是代码缓存问题。试试：

```bash
# 停止前端服务 (Ctrl+C)
cd frontend

# 清除 webpack 缓存
rm -rf node_modules/.cache

# 重新启动
npm start
```

然后：
1. 强制刷新浏览器（Ctrl+F5）
2. 重新配置 AK/SK
3. 测试上传

---

**提示**: 如果你看到日志中显示 `accessKeyIdLength: 0`，说明配置确实没有被读取到。

