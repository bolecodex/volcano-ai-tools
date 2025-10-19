# 配置系统快速上手

## 快速开始

### 1. 初始化数据库表

启动后端服务时会自动创建配置表：

```bash
cd backend
python main.py
```

### 2. 初始化预定义配置项（可选）

运行初始化脚本创建配置模板：

```bash
cd backend
python init_configs.py
```

查看已创建的配置：

```bash
python init_configs.py list
```

### 3. 使用API管理配置

#### 步骤1：用户登录获取Token

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

响应示例：
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 步骤2：创建配置

```bash
curl -X POST http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "config_key": "volcano_ark_token",
    "config_value": "your-actual-token-here",
    "config_type": "token",
    "category": "volcano_ark",
    "description": "火山方舟API访问令牌",
    "is_encrypted": false,
    "is_active": true
  }'
```

#### 步骤3：查看配置列表

查看所有配置：
```bash
curl -X GET http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

按分类查看：
```bash
curl -X GET http://localhost:8000/api/configs/category/volcano_ark \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 步骤4：更新配置

```bash
curl -X PUT http://localhost:8000/api/configs/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "config_value": "new-token-value"
  }'
```

## 配置项说明

### 火山方舟 (volcano_ark)

| 配置键 | 说明 | 必填 |
|--------|------|------|
| volcano_ark_token | API访问令牌 | 是 |
| volcano_ark_api_key | API密钥 | 否 |
| volcano_ark_endpoint | 服务端点URL | 否 |

### 火山引擎 (volcano_engine)

| 配置键 | 说明 | 必填 |
|--------|------|------|
| volcano_engine_access_key | 访问密钥AK | 是 |
| volcano_engine_secret_key | 私密密钥SK | 是 |
| volcano_engine_region | 区域设置 | 否 |

### TOS存储 (tos)

| 配置键 | 说明 | 必填 |
|--------|------|------|
| tos_bucket_name | 存储桶名称 | 是 |
| tos_bucket_endpoint | 存储桶端点 | 否 |
| tos_access_key | 访问密钥 | 是 |
| tos_secret_key | 私密密钥 | 是 |
| tos_region | 区域 | 否 |

## 完整配置示例

### 配置火山方舟

```bash
# 1. 设置Token
curl -X POST http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_key": "volcano_ark_token",
    "config_value": "ark_xxxxxxxxxxxxx",
    "config_type": "token",
    "category": "volcano_ark",
    "description": "火山方舟API访问令牌"
  }'

# 2. 设置API Key
curl -X POST http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_key": "volcano_ark_api_key",
    "config_value": "your-api-key",
    "config_type": "key",
    "category": "volcano_ark",
    "description": "火山方舟API密钥"
  }'
```

### 配置火山引擎

```bash
# 1. 设置AK
curl -X POST http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_key": "volcano_engine_access_key",
    "config_value": "AKLTXXXXXXXXXX",
    "config_type": "key",
    "category": "volcano_engine",
    "description": "火山引擎访问密钥AK"
  }'

# 2. 设置SK（建议加密）
curl -X POST http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_key": "volcano_engine_secret_key",
    "config_value": "your-secret-key-here",
    "config_type": "key",
    "category": "volcano_engine",
    "description": "火山引擎私密密钥SK",
    "is_encrypted": true
  }'
```

### 配置TOS存储

```bash
# 1. 设置桶名称
curl -X POST http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_key": "tos_bucket_name",
    "config_value": "my-tos-bucket",
    "config_type": "string",
    "category": "tos",
    "description": "TOS存储桶名称"
  }'

# 2. 设置TOS访问密钥（如果与火山引擎共用，可以跳过）
curl -X POST http://localhost:8000/api/configs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_key": "tos_access_key",
    "config_value": "AKLTXXXXXXXXXX",
    "config_type": "key",
    "category": "tos",
    "description": "TOS访问密钥"
  }'
```

## 在代码中使用配置

```python
from sqlalchemy import select
from database import get_db, SystemConfig

async def get_volcano_ark_token(db):
    """获取火山方舟token"""
    result = await db.execute(
        select(SystemConfig).where(
            SystemConfig.config_key == "volcano_ark_token",
            SystemConfig.is_active == True
        )
    )
    config = result.scalar_one_or_none()
    return config.config_value if config else None

async def get_volcano_engine_credentials(db):
    """获取火山引擎AK/SK"""
    # 获取AK
    ak_result = await db.execute(
        select(SystemConfig).where(
            SystemConfig.config_key == "volcano_engine_access_key",
            SystemConfig.is_active == True
        )
    )
    ak_config = ak_result.scalar_one_or_none()
    
    # 获取SK
    sk_result = await db.execute(
        select(SystemConfig).where(
            SystemConfig.config_key == "volcano_engine_secret_key",
            SystemConfig.is_active == True
        )
    )
    sk_config = sk_result.scalar_one_or_none()
    
    return {
        "access_key": ak_config.config_value if ak_config else None,
        "secret_key": sk_config.config_value if sk_config else None
    }
```

## 注意事项

1. **敏感信息保护**
   - 生产环境中，SK等敏感信息应设置 `is_encrypted: true`
   - 不要在日志中输出敏感配置
   - 定期轮换密钥

2. **配置验证**
   - 创建配置后，建议测试其有效性
   - 使用前检查配置是否存在且启用

3. **备份恢复**
   - 定期备份配置数据
   - 重要配置变更前先备份

4. **权限控制**
   - 所有配置接口都需要登录认证
   - 生产环境建议添加更细粒度的权限控制

## 常见问题

### Q: 如何批量导入配置？

A: 可以编写脚本批量调用创建接口，或直接操作数据库导入。

### Q: 配置支持加密吗？

A: 当前 `is_encrypted` 字段仅作标记，实际加密功能需要单独实现。

### Q: 如何在不同环境使用不同配置？

A: 可以使用 `category` 字段进一步细分，如 `volcano_ark_dev`, `volcano_ark_prod`。

### Q: 配置删除后可以恢复吗？

A: 当前不支持软删除，建议重要配置先备份再删除。

