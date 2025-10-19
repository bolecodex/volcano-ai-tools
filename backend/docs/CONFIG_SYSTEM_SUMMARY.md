# 系统配置功能更新说明

## 更新概述

为项目添加了系统配置管理功能，用于存储和管理各种第三方服务的token、key和配置信息。

## 更新时间

2025年10月13日

## 新增内容

### 1. 数据库表

**`system_configs` 表** (`backend/database.py`)
- 用于存储系统配置的键值对
- 支持分类管理（火山方舟、火山引擎、TOS等）
- 支持加密标记
- 包含启用/禁用状态控制

主要字段：
- `config_key`: 配置键名（唯一）
- `config_value`: 配置值
- `config_type`: 配置类型
- `category`: 配置分类
- `description`: 配置描述
- `is_encrypted`: 是否加密
- `is_active`: 是否启用

### 2. 数据模型

**Pydantic Schema** (`backend/schemas.py`)
- `SystemConfigBase`: 基础配置模型
- `SystemConfigCreate`: 创建配置请求模型
- `SystemConfigUpdate`: 更新配置请求模型
- `SystemConfigResponse`: 配置响应模型
- `SystemConfigListResponse`: 配置列表响应模型

### 3. API接口

**配置管理路由** (`backend/config_routes.py`)

所有接口路径前缀：`/api/configs`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/` | 创建配置 |
| GET | `/` | 获取配置列表（支持分页和筛选） |
| GET | `/{config_id}` | 根据ID获取配置 |
| GET | `/key/{config_key}` | 根据键名获取配置 |
| GET | `/category/{category}` | 根据分类获取配置 |
| PUT | `/{config_id}` | 更新配置 |
| DELETE | `/{config_id}` | 删除配置 |

**认证要求**：所有接口都需要登录认证（Bearer Token）

### 4. 工具脚本

**配置初始化脚本** (`backend/init_configs.py`)
- 自动创建预定义的配置项模板
- 包含火山方舟、火山引擎、TOS的配置模板
- 支持列出当前所有配置

使用方法：
```bash
python init_configs.py        # 初始化配置
python init_configs.py list   # 列出所有配置
```

### 5. 文档

新增三个文档文件：

1. **CONFIG_GUIDE.md** - 详细使用指南
   - 完整的API接口说明
   - 配置分类详解
   - 使用示例
   - 安全建议

2. **CONFIG_QUICKSTART.md** - 快速上手指南
   - 快速开始步骤
   - 常用操作示例
   - 代码集成示例
   - 常见问题解答

3. **CONFIG_SYSTEM_SUMMARY.md** - 本文档
   - 更新概述
   - 功能列表

## 支持的配置类型

### 火山方舟 (volcano_ark)
- Token
- API Key
- Endpoint URL

### 火山引擎 (volcano_engine)
- Access Key (AK)
- Secret Key (SK)
- Region

### TOS存储 (tos)
- Bucket Name
- Bucket Endpoint
- Access Key
- Secret Key
- Region

## 使用流程

1. **启动服务** → 自动创建数据库表
2. **（可选）运行初始化脚本** → 创建配置模板
3. **用户登录** → 获取访问Token
4. **通过API管理配置** → 创建/读取/更新/删除配置
5. **在业务代码中使用配置** → 读取配置值

## 文件变更清单

### 新增文件
- `backend/config_routes.py` - 配置管理路由
- `backend/init_configs.py` - 配置初始化脚本
- `backend/docs/CONFIG_GUIDE.md` - 详细使用指南
- `backend/docs/CONFIG_QUICKSTART.md` - 快速上手指南
- `CONFIG_SYSTEM_SUMMARY.md` - 本文档

### 修改文件
- `backend/database.py` - 添加SystemConfig模型
- `backend/schemas.py` - 添加配置相关Schema
- `backend/main.py` - 注册配置路由

## 安全建议

1. 敏感配置（如SK）设置 `is_encrypted: true` 标记
2. 定期轮换token和密钥
3. 不要在日志中打印敏感信息
4. 生产环境使用专门的密钥管理服务
5. 定期备份配置数据

## 未来扩展方向

1. 实现真正的配置加密/解密功能
2. 添加配置版本控制
3. 实现配置变更审计日志
4. 支持配置批量导入导出
5. 添加配置值验证功能
6. 实现配置缓存机制

## 相关文档

- 详细使用指南：`backend/docs/CONFIG_GUIDE.md`
- 快速上手：`backend/docs/CONFIG_QUICKSTART.md`
- 认证指南：`backend/docs/AUTH_GUIDE.md`

## 技术栈

- FastAPI - Web框架
- SQLAlchemy - ORM
- Pydantic - 数据验证
- SQLite/aiosqlite - 数据库
- JWT - 身份认证

