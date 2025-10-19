# 系统配置管理 - 快速参考卡

## 🚀 一分钟快速开始

### 启动服务
```bash
# Terminal 1 - 后端
cd backend && python main.py

# Terminal 2 - 前端  
cd frontend && npm start
```

### 访问配置管理
```
1. 浏览器打开: http://localhost:3000
2. 登录账号
3. 点击导航栏"系统配置"
```

## 📝 常用操作

### 创建配置
```
点击"新建配置" → 填写表单 → 保存
```

### 编辑配置
```
找到配置行 → 点击"编辑" → 修改 → 保存
```

### 删除配置
```
找到配置行 → 点击"删除" → 确认
```

### 切换分类
```
点击顶部分类标签: 全部/火山方舟/火山引擎/TOS/通用
```

## 🔑 预置配置键名

### 火山方舟
```
volcano_ark_token          # Token
volcano_ark_api_key        # API Key
volcano_ark_endpoint       # Endpoint
```

### 火山引擎
```
volcano_engine_access_key  # AK
volcano_engine_secret_key  # SK (建议加密)
volcano_engine_region      # Region
```

### TOS存储
```
tos_bucket_name           # 桶名称
tos_bucket_endpoint       # 端点
tos_access_key           # AK
tos_secret_key           # SK (建议加密)
tos_region               # Region
```

## 🔌 API快速参考

### 获取Token
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'
```

### 创建配置
```bash
curl -X POST http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "config_key": "your_key",
    "config_value": "your_value",
    "config_type": "string",
    "category": "general"
  }'
```

### 查看所有配置
```bash
curl http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer {token}"
```

### 按分类查看
```bash
curl http://localhost:8000/api/configs/category/volcano_ark \
  -H "Authorization: Bearer {token}"
```

### 更新配置
```bash
curl -X PUT http://localhost:8000/api/configs/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"config_value": "new_value"}'
```

### 删除配置
```bash
curl -X DELETE http://localhost:8000/api/configs/{id} \
  -H "Authorization: Bearer {token}"
```

## 🎨 配置类型

| 类型 | 说明 | 示例 |
|------|------|------|
| string | 字符串 | 普通文本 |
| token | Token | API Token |
| key | 密钥 | AK/SK |
| json | JSON | 复杂配置 |

## 🏷️ 配置分类

| 分类 | 英文名 | 颜色 |
|------|--------|------|
| 火山方舟 | volcano_ark | 🔴 红色 |
| 火山引擎 | volcano_engine | 🟡 黄色 |
| TOS存储 | tos | 🔵 蓝色 |
| 通用配置 | general | ⚪ 灰色 |

## 🛡️ 安全建议

### 敏感配置
```
✅ 勾选"加密存储"
✅ 设置强密码
✅ 定期轮换密钥
❌ 不在日志中输出
❌ 不分享给他人
```

### 配置管理
```
✅ 定期备份
✅ 记录变更
✅ 最小权限原则
❌ 不删除正在使用的配置
❌ 不在生产环境测试
```

## 🐛 故障排查

### 看不到配置菜单
```
→ 确认是否已登录
```

### 无法创建配置
```
→ 检查配置键是否重复
→ 检查是否有登录token
→ 检查后端服务是否运行
```

### 配置不生效
```
→ 确认配置状态为"启用"
→ 重启应用程序
→ 检查配置键名是否正确
```

### API调用失败
```
→ 检查token是否有效
→ 检查API地址是否正确
→ 查看浏览器控制台错误
```

## 📱 快捷键

| 按键 | 功能 |
|------|------|
| ESC | 关闭对话框 |
| Enter | 提交表单 |

## 🔢 API端点速查

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/configs/` | GET | 列表 |
| `/api/configs/` | POST | 创建 |
| `/api/configs/{id}` | GET | 详情 |
| `/api/configs/{id}` | PUT | 更新 |
| `/api/configs/{id}` | DELETE | 删除 |
| `/api/configs/key/{key}` | GET | 按键名 |
| `/api/configs/category/{cat}` | GET | 按分类 |

## 💾 初始化脚本

### 创建预置配置
```bash
cd backend
python init_configs.py
```

### 查看现有配置
```bash
python init_configs.py list
```

## 📚 文档链接

- [详细指南](backend/docs/CONFIG_GUIDE.md)
- [快速上手](backend/docs/CONFIG_QUICKSTART.md)
- [前端使用](frontend/docs/CONFIG_USAGE.md)
- [完整总结](COMPLETE_UPDATE_SUMMARY.md)

## ⚡ 常见配置示例

### 火山方舟Token
```json
{
  "config_key": "volcano_ark_token",
  "config_value": "ark_xxxxx",
  "config_type": "token",
  "category": "volcano_ark",
  "description": "火山方舟API访问令牌"
}
```

### 火山引擎AK
```json
{
  "config_key": "volcano_engine_access_key",
  "config_value": "AKLT...",
  "config_type": "key",
  "category": "volcano_engine",
  "description": "火山引擎访问密钥"
}
```

### TOS桶名称
```json
{
  "config_key": "tos_bucket_name",
  "config_value": "my-bucket",
  "config_type": "string",
  "category": "tos",
  "description": "TOS存储桶名称"
}
```

## 📞 技术支持

遇到问题？检查顺序：

1. ✅ 查看文档
2. ✅ 检查日志
3. ✅ 验证配置
4. ✅ 测试连接
5. ✅ 重启服务

---

**提示:** 将此文档加入书签，随时查阅！

