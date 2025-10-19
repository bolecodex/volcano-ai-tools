# 前端快速启动指南

## 系统要求

- Node.js 14.0 或更高版本
- npm 6.0 或更高版本

检查版本：
```bash
node --version
npm --version
```

## 安装步骤

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

使用启动脚本：

**Windows**:
```bash
cd ..  # 返回项目根目录
start-frontend.bat
```

**macOS/Linux**:
```bash
cd ..  # 返回项目根目录
./start-frontend.sh
```

或者直接运行：
```bash
cd frontend
npm start
```

开发服务器将在 http://localhost:3000 启动，并自动打开浏览器。

### 3. 验证安装

浏览器应该自动打开并显示应用首页。如果没有，手动访问：

```
http://localhost:3000
```

## 功能测试

### 测试后端连接

1. 确保后端服务已启动（http://localhost:8000）
2. 在首页点击"测试后端连接"按钮
3. 如果连接成功，会显示后端返回的消息

### 测试用户注册

1. 点击导航栏的"注册"按钮
2. 填写注册表单：
   - 用户名: 至少3个字符
   - 邮箱: 有效的邮箱地址
   - 密码: 至少6个字符
   - 确认密码: 与密码一致
3. 点击"注册"按钮
4. 注册成功后会自动跳转到登录页

### 测试用户登录

1. 点击导航栏的"登录"按钮
2. 输入用户名和密码
3. 点击"登录"按钮
4. 登录成功后：
   - 导航栏会显示用户名下拉菜单
   - 首页会显示欢迎消息
   - Token会保存在localStorage中

### 测试用户登出

1. 点击导航栏的用户名下拉菜单
2. 选择"登出"
3. 系统会清除token并返回首页

## 开发模式特性

### 热重载

修改代码后，浏览器会自动刷新显示最新内容。

### 开发者工具

按 F12 打开浏览器开发者工具，可以查看：

- Console（控制台）: 查看日志和错误
- Network（网络）: 查看API请求
- Application（应用）: 查看localStorage中的token
- React DevTools: 查看组件状态和props

## 项目结构

```
frontend/
├── public/              # 静态资源
│   └── index.html      # HTML模板
├── src/                # 源代码
│   ├── components/     # React组件
│   │   ├── Login.js    # 登录组件
│   │   └── Register.js # 注册组件
│   ├── styles/         # 样式文件
│   │   └── index.css   # 全局样式
│   ├── App.js          # 主应用组件
│   ├── config.js       # 配置文件
│   └── index.js        # 入口文件
├── package.json        # 项目配置
└── webpack.config.js   # Webpack配置
```

## 配置说明

### 修改API地址

如果后端运行在不同的端口或域名，修改 `src/config.js`：

```javascript
export const API_BASE_URL = 'http://localhost:8000';  // 修改为你的API地址
```

或者设置环境变量：

```bash
# .env 文件
REACT_APP_API_URL=http://localhost:8000
```

### 修改开发端口

在 `package.json` 中修改启动脚本：

```json
{
  "scripts": {
    "start": "PORT=3001 webpack serve --mode development"
  }
}
```

或者在启动时指定：

```bash
PORT=3001 npm start
```

## 样式定制

### 修改主题色

Bootstrap的主题色可以通过CSS变量修改。在 `src/styles/index.css` 中添加：

```css
:root {
  --bs-primary: #0d6efd;    /* 主色 */
  --bs-success: #198754;    /* 成功色 */
  --bs-danger: #dc3545;     /* 危险色 */
}
```

### 添加自定义样式

在 `src/styles/index.css` 中添加新的样式类：

```css
.my-custom-class {
  /* 你的样式 */
}
```

## 构建生产版本

### 构建命令

```bash
npm run build
```

这会在 `dist/` 目录生成优化后的生产文件。

### 预览生产构建

```bash
# 安装serve（如果未安装）
npm install -g serve

# 预览构建结果
cd dist
serve -s .
```

## 常见问题

### Q1: 无法连接到后端

**症状**: 显示"无法连接到后端服务器"错误

**解决方案**:
1. 确认后端服务已启动: http://localhost:8000
2. 检查CORS配置是否正确
3. 查看浏览器控制台的Network标签，检查错误详情

### Q2: 页面刷新后仍然显示登录状态

这是正常行为。Token保存在localStorage中，刷新后会自动恢复登录状态。

### Q3: Token过期后会怎样？

当token过期时（默认30分钟），访问需要认证的API会返回401错误，系统会自动清除token并要求重新登录。

### Q4: 如何清除所有数据？

```javascript
// 在浏览器控制台执行
localStorage.clear();
location.reload();
```

### Q5: npm install 失败

**解决方案**:
1. 清除缓存: `npm cache clean --force`
2. 删除node_modules: `rm -rf node_modules`
3. 重新安装: `npm install`

### Q6: 端口被占用

**错误信息**: `Port 3000 is already in use`

**解决方案**:
1. 终止占用端口的进程
2. 或者使用不同端口: `PORT=3001 npm start`

## 调试技巧

### 查看当前Token

在浏览器控制台执行：

```javascript
console.log(localStorage.getItem('token'));
```

### 解码Token内容

```javascript
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token内容:', payload);
  console.log('过期时间:', new Date(payload.exp * 1000));
}
```

### 模拟Token过期

```javascript
// 设置一个过期的token
localStorage.setItem('token', 'expired-token');
location.reload();
```

### 查看组件状态

安装 React DevTools 浏览器扩展，可以查看：
- 组件树
- Props和State
- Context值
- Hooks状态

## 性能优化

### 代码分割

使用React.lazy进行代码分割：

```javascript
const Login = React.lazy(() => import('./components/Login'));
const Register = React.lazy(() => import('./components/Register'));
```

### 生产构建优化

Webpack已配置了以下优化：
- 代码压缩
- Tree shaking
- 资源哈希
- 代码分割

## 下一步

- 查看 [AUTH_GUIDE.md](./AUTH_GUIDE.md) 了解详细的前端架构
- 学习如何添加新功能和组件
- 了解如何部署到生产环境

## 开发工具推荐

- **VS Code**: 推荐的代码编辑器
- **React DevTools**: React调试工具
- **Redux DevTools**: 状态管理调试（如果使用Redux）
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化

## 获取帮助

如遇到问题，请检查：

1. Node.js和npm版本是否符合要求
2. 依赖是否完整安装
3. 后端服务是否正常运行
4. 浏览器控制台是否有错误信息
5. Network标签中的API请求是否成功

查看浏览器控制台输出，通常会有详细的错误信息。

