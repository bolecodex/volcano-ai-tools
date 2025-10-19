# 🔧 火山AI功能配置指南

## ✅ 已完成的修复

我们已经成功将 Electron 应用的前端代码迁移到 Web 应用，并创建了一个 API 适配层来桥接前端和后端通信。

### 修复内容
- ✅ 创建了 `frontend/src/api/volcanoAPI.js` API 客户端
- ✅ 在 `frontend/src/index.js` 中注入了 `window.electronAPI` 适配层
- ✅ 前端现在可以通过 HTTP 请求与后端通信

---

## 🎯 如何使用火山AI功能

### 1. 访问应用
打开浏览器访问: **http://localhost:3000**

### 2. 进入火山AI工作台
点击顶部导航栏的 **"🎨 火山AI创作工坊"** 按钮

### 3. 配置 API 密钥

#### 方式1: 在设置页面配置
1. 点击侧边栏的 **"设置"**
2. 输入以下密钥：
   - **ARK API Key**: 用于 Seedream 4.0 图片生成
   - **Access Key ID**: 用于即梦系列功能
   - **Secret Access Key**: 用于即梦系列功能

#### 方式2: 在组件中直接配置
大部分组件都有 API 密钥输入框，可以直接在页面上配置。

---

## 🎨 可用功能列表

### 1. AI 图片生成 ✅

#### Seedream 4.0 (推荐)
- **需要**: ARK API Key
- **功能**: 文生图、图生图、组图生成
- **特点**: 同步生成，立即获得结果
- **使用**: 
  1. 选择模型 "Seedream 4.0"
  2. 输入提示词
  3. 点击生成

#### 即梦 AI 4.0 ⭐
- **需要**: Access Key ID + Secret Access Key
- **功能**: 文生图、图生图、多图融合，支持4K
- **特点**: 异步任务，需要轮询查询结果
- **使用**:
  1. 选择模型 "即梦AI 4.0"
  2. 在设置中配置 Access Keys
  3. 输入提示词
  4. 点击生成（会自动轮询任务状态）

#### 即梦图生图 3.0 🖼️
- **需要**: Access Key ID + Secret Access Key
- **功能**: 图生图编辑专用，精准执行编辑指令
- **使用**: 类似即梦 4.0

#### 即梦文生图 3.1 🎨
- **需要**: Access Key ID + Secret Access Key
- **功能**: 画面美感升级，风格精准多样
- **使用**: 类似即梦 4.0

---

### 2. 智能绘图 (Inpainting) ✅
- **需要**: Access Key ID + Secret Access Key
- **功能**: 涂抹编辑，AI 智能填充
- **使用**:
  1. 上传原图和蒙版图
  2. 输入编辑提示词
  3. 配置参数（采样步数、引导强度等）
  4. 点击生成

---

### 3. AI 视频生成 ✅
- **需要**: ARK API Key
- **功能**: 文生视频、图生视频
- **使用**:
  1. 选择生成模式
  2. 输入提示词或上传图片
  3. 创建任务
  4. 在任务列表中查看进度

---

### 4. 其他功能
以下功能已迁移，但可能需要额外配置：
- 视频编辑
- 动作模仿
- 数字人 (OmniHuman1.5)
- 配音配乐
- 智能搜图

如需使用这些功能，请参考各自的 API 文档配置相应的参数。

---

## 🔑 获取 API 密钥

### ARK API Key
1. 访问: https://www.volcengine.com/
2. 注册并登录火山引擎账号
3. 进入控制台 → API 管理
4. 创建 ARK API Key

### Access Key ID / Secret Access Key
1. 访问: https://www.volcengine.com/
2. 进入控制台 → 账号管理 → 访问密钥
3. 创建新的访问密钥对

---

## 🐛 故障排除

### 问题1: 提示 "Cannot read properties of undefined"
**原因**: 前端未加载 API 适配层  
**解决**: 
1. 清除浏览器缓存
2. 刷新页面 (Ctrl+F5 或 Cmd+Shift+R)
3. 检查浏览器控制台是否有 "🌐 Web 模式: 已注入 volcanoAPI 适配层" 的日志

### 问题2: API 调用返回 404
**原因**: 后端路由未正确配置  
**解决**:
1. 确认后端服务正在运行: `curl http://localhost:8000/health`
2. 检查后端日志: `tail -f backend/backend.log`

### 问题3: CORS 错误
**原因**: 跨域请求被阻止  
**解决**:
1. 确认后端 CORS 配置包含前端地址
2. 检查 `backend/main.py` 中的 CORS 中间件配置

### 问题4: 即梦系列功能无法使用
**原因**: 
- 未配置 Access Keys
- 后端路由不完整

**解决**:
1. 在设置页面配置 Access Key ID 和 Secret Access Key
2. 检查后端是否正确处理签名 V4 认证

---

## 📚 相关文档

- [后端 API 文档](http://localhost:8000/docs)
- [迁移总结](MIGRATION_SUMMARY.md)
- [项目 README](README.md)

---

## 💡 提示

### 测试建议
1. **先测试 Seedream 4.0**: 这是最简单的，只需要 ARK API Key
2. **再测试视频生成**: 使用相同的 ARK API Key
3. **最后测试即梦系列**: 需要配置 Access Keys，稍微复杂一些

### 开发调试
- 打开浏览器开发者工具 (F12)
- 查看 Console 标签页的日志
- 查看 Network 标签页的请求详情
- 后端日志: `tail -f backend/backend.log`

---

## 🎉 完成！

现在您可以：
1. ✅ 在浏览器中使用火山AI功能
2. ✅ 通过 HTTP API 与后端通信
3. ✅ 使用所有迁移过来的 AI 创作功能

**祝您使用愉快！** 🚀

