# 前端项目说明

这是基于 React + Bootstrap 构建的 Web 应用前端。

## 技术栈

- **React 18.x** - 用户界面库
- **React Bootstrap** - Bootstrap 5 的 React 组件
- **Webpack 5** - 模块打包工具
- **Babel** - JavaScript 编译器
- **Axios** - HTTP 请求库

## 目录结构

```
frontend/
├── src/                    # 源代码
│   ├── App.js             # 主应用组件
│   ├── index.js           # React 入口文件
│   └── styles/            # 样式文件
│       └── index.css
├── public/                # 静态资源
│   └── index.html         # HTML 模板
├── webpack.config.js      # Webpack 配置
└── package.json           # 项目配置和依赖
```

## 开发命令

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm start          # 启动开发服务器（自动打开浏览器）
npm run dev        # 启动开发服务器（不自动打开浏览器）
```

### 构建
```bash
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
```

## React 应用

### 主要组件

- **App.js**: 主应用组件，包含导航栏和主要内容
- **index.js**: React 应用入口，渲染 App 组件

### 样式

使用 Bootstrap 5 提供的组件和样式，在 `src/styles/index.css` 中可添加自定义样式。

## API 集成

使用 Axios 与后端 FastAPI 服务通信：

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// 示例请求
const response = await axios.get(`${API_BASE_URL}/api/users`);
```

## Webpack 配置

`webpack.config.js` 配置了以下功能：

- **入口**: `src/index.js`
- **输出**: `build/` 目录，文件名包含内容哈希
- **Babel**: 转译 JSX 和 ES6+ 代码
- **CSS**: 支持 CSS 模块加载
- **图片**: 自动处理图片资源
- **开发服务器**: 热模块替换(HMR)
- **生产优化**: 代码分割、压缩

## 注意事项

1. **开发环境**: 确保后端服务在 `http://localhost:8000` 运行
2. **CORS**: 后端已配置允许 `localhost:3000` 的跨域请求
3. **热重载**: Webpack Dev Server 支持热模块替换(HMR)
4. **端口**: 默认使用 3000 端口，如需修改请编辑 `webpack.config.js`
5. **浏览器兼容性**: 支持所有现代浏览器

## 添加新功能

### 添加新组件

1. 在 `src/` 目录下创建新的 `.js` 文件
2. 在 `App.js` 或其他组件中引入

```javascript
import MyComponent from './MyComponent';

function App() {
  return <MyComponent />;
}
```

### 添加新样式

在 `src/styles/` 目录下添加 CSS 文件，然后在组件中引入：

```javascript
import './styles/myStyles.css';
```

### 使用 Bootstrap 组件

```javascript
import { Button, Card, Container } from 'react-bootstrap';

function MyComponent() {
  return (
    <Container>
      <Card>
        <Card.Body>
          <Button variant="primary">点击我</Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
```

## 调试

### 开发者工具

在浏览器中按 F12 或右键选择"检查"打开开发者工具。

### React Developer Tools

推荐安装 React Developer Tools 浏览器扩展：
- [Chrome 扩展](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox 扩展](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## 常见问题

### Q: 为什么浏览器显示空白页面？
A: 检查控制台是否有错误，确保所有依赖已正确安装（运行 `npm install`）

### Q: 如何更改开发服务器端口？
A: 在 `webpack.config.js` 的 `devServer.port` 配置中修改

### Q: 如何部署到生产环境？
A: 运行 `npm run build`，然后将 `build/` 目录部署到 Web 服务器

### Q: 如何添加环境变量？
A: 使用 webpack 的 DefinePlugin 或创建 `.env` 文件配合 dotenv-webpack

## 部署

### 静态文件托管

构建后的应用可以部署到任何静态文件托管服务：

1. **Vercel**
```bash
npm install -g vercel
vercel
```

2. **Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

3. **GitHub Pages**
在 `package.json` 添加 `homepage` 字段，然后使用 `gh-pages` 部署

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 相关链接

- [React 文档](https://react.dev/)
- [React Bootstrap 文档](https://react-bootstrap.github.io/)
- [Webpack 文档](https://webpack.js.org/)
- [Babel 文档](https://babeljs.io/)

