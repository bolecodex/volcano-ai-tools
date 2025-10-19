# 用户认证系统使用说明

## 🎉 新功能已添加！

您的系统现在拥有完整的用户登录注册功能！

## 🚀 快速开始

### 第一步：安装后端依赖

```bash
cd backend
source venv/bin/activate  # macOS/Linux
# 或者 venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 第二步：启动后端

```bash
# 如果在backend目录
python main.py

# 或者使用启动脚本（从项目根目录）
./start-backend.sh  # macOS/Linux
start-backend.bat   # Windows
```

后端将在 http://localhost:8000 启动

### 第三步：安装前端依赖（如果还没有）

```bash
cd frontend
npm install
```

### 第四步：启动前端

```bash
# 如果在frontend目录
npm start

# 或者使用启动脚本（从项目根目录）
./start-frontend.sh  # macOS/Linux
start-frontend.bat   # Windows
```

前端将在 http://localhost:3000 启动

## 📖 使用教程

### 注册新用户

1. 打开浏览器访问 http://localhost:3000
2. 点击导航栏右上角的"注册"按钮
3. 填写注册表单：
   - **用户名**: 至少3个字符（例如：`testuser`）
   - **邮箱**: 有效的邮箱地址（例如：`test@example.com`）
   - **密码**: 至少6个字符（例如：`password123`）
   - **确认密码**: 再次输入相同的密码
4. 点击"注册"按钮
5. 注册成功后会自动跳转到登录页面

### 登录账号

1. 在登录页面输入：
   - **用户名**: 你注册时使用的用户名
   - **密码**: 你的密码
2. 点击"登录"按钮
3. 登录成功后：
   - 导航栏会显示你的用户名
   - 首页会显示欢迎消息

### 查看用户信息

登录后，点击导航栏右上角的用户名，会显示下拉菜单，其中包含：
- 你的邮箱地址
- 登出选项

### 登出

点击用户名下拉菜单中的"登出"按钮即可退出登录。

## 🔍 测试API（可选）

### 使用Swagger UI测试

1. 访问 http://localhost:8000/docs
2. 你会看到所有的API接口
3. 可以直接在页面上测试注册、登录等功能

### 认证相关的API端点

- **注册**: `POST /api/auth/register`
- **登录**: `POST /api/auth/login`
- **获取当前用户**: `GET /api/auth/me`
- **登出**: `POST /api/auth/logout`

## 🛠️ 技术实现

### 后端

- ✅ JWT Token 认证
- ✅ Bcrypt 密码加密
- ✅ 用户数据持久化（SQLite数据库）
- ✅ 完整的数据验证

### 前端

- ✅ React 登录/注册组件
- ✅ Token 自动管理（localStorage）
- ✅ 页面刷新保持登录状态
- ✅ 美观的 Bootstrap UI

## 📁 重要文件位置

### 后端核心文件

```
backend/
├── auth.py           # 认证逻辑（密码加密、JWT生成）
├── auth_routes.py    # 认证API路由
├── database.py       # 数据库模型（User表）
├── schemas.py        # 数据验证模型
└── main.py          # 主应用（已集成认证路由）
```

### 前端核心文件

```
frontend/src/
├── components/
│   ├── Login.js     # 登录组件
│   └── Register.js  # 注册组件
├── App.js          # 主应用（集成了用户状态管理）
└── config.js       # API配置
```

## 📚 详细文档

想了解更多细节？查看以下文档：

- **后端认证指南**: `backend/docs/AUTH_GUIDE.md`
- **后端快速启动**: `backend/docs/QUICKSTART.md`
- **前端认证指南**: `frontend/docs/AUTH_GUIDE.md`
- **前端快速启动**: `frontend/docs/QUICKSTART.md`
- **更新总结**: `AUTH_UPDATE_SUMMARY.md`

## ⚠️ 重要提醒

### 生产环境必须修改的配置

在部署到生产环境之前，请务必：

1. **修改JWT密钥** (`backend/auth.py`)
   ```python
   SECRET_KEY = "your-secret-key-here-change-in-production"
   ```
   
   生成新密钥：
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **使用HTTPS** 确保所有通信都通过HTTPS

3. **更新CORS配置** 只允许可信的域名访问

4. **使用生产级数据库** 从SQLite迁移到PostgreSQL或MySQL

## ❓ 常见问题

### Q: 如何重置数据库？

删除数据库文件后重启后端：
```bash
cd backend
rm hs_adk.db
python main.py
```

### Q: Token过期了怎么办？

默认token有效期是30分钟，过期后需要重新登录。

### Q: 忘记密码怎么办？

目前还没有密码重置功能，只能重新注册（或者直接在数据库中修改）。

### Q: 如何修改token有效期？

编辑 `backend/auth.py`，修改：
```python
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 改为你需要的分钟数
```

### Q: 前端无法连接后端？

1. 确认后端已启动（访问 http://localhost:8000）
2. 检查CORS配置
3. 查看浏览器控制台的错误信息

## 🎯 下一步

现在你可以：

1. ✅ 创建多个测试账号
2. ✅ 测试登录/登出功能
3. ✅ 查看用户信息
4. ✅ 开始开发需要用户认证的功能
5. ✅ 添加更多自定义功能

## 🤝 需要帮助？

- 查看详细文档（在各个docs文件夹中）
- 检查浏览器控制台的错误信息
- 查看后端日志输出
- 访问 http://localhost:8000/docs 查看API文档

---

**祝使用愉快！** 🎊

如果一切正常，你现在应该能看到一个带有用户登录注册功能的完整Web应用了！

