# 系统配置管理指南

## 概述

系统配置表用于存储各种第三方服务的token、key和配置信息，包括：
- 火山方舟 (Volcano Ark) 的 token 和 key
- 火山引擎 (Volcano Engine) 的 AK (Access Key) 和 SK (Secret Key)
- TOS (火山引擎对象存储) 的桶配置

## 数据库表结构

### `system_configs` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键，自增 |
| config_key | String | 配置键名（唯一索引） |
| config_value | Text | 配置值 |
| config_type | String | 配置类型：string, token, key, json |
| category | String | 配置分类：volcano_ark, volcano_engine, tos, general |
| description | String | 配置描述 |
| is_encrypted | Boolean | 是否加密存储 |
| is_active | Boolean | 是否启用 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

## API 端点

所有配置管理接口都需要用户登录认证。

### 1. 创建配置

```http
POST /api/configs/
Authorization: Bearer {token}
Content-Type: application/json

{
  "config_key": "volcano_ark_token",
  "config_value": "your-token-here",
  "config_type": "token",
  "category": "volcano_ark",
  "description": "火山方舟API访问令牌",
  "is_encrypted": false,
  "is_active": true
}
```

### 2. 获取所有配置

```http
GET /api/configs/?category=volcano_ark&is_active=true&skip=0&limit=100
Authorization: Bearer {token}
```

### 3. 根据ID获取配置

```http
GET /api/configs/{config_id}
Authorization: Bearer {token}
```

### 4. 根据键名获取配置

```http
GET /api/configs/key/{config_key}
Authorization: Bearer {token}
```

### 5. 根据分类获取配置

```http
GET /api/configs/category/{category}
Authorization: Bearer {token}
```

### 6. 更新配置

```http
PUT /api/configs/{config_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "config_value": "new-value",
  "is_active": true
}
```

### 7. 删除配置

```http
DELETE /api/configs/{config_id}
Authorization: Bearer {token}
```

## 配置分类说明

### volcano_ark (火山方舟)
- `volcano_ark_token`: API访问令牌
- `volcano_ark_api_key`: API密钥
- `volcano_ark_endpoint`: 服务端点URL

### volcano_engine (火山引擎)
- `volcano_engine_access_key`: 访问密钥 (AK)
- `volcano_engine_secret_key`: 私密密钥 (SK)
- `volcano_engine_region`: 区域设置

### tos (火山引擎对象存储)
- `tos_bucket_name`: 存储桶名称
- `tos_bucket_endpoint`: 存储桶端点
- `tos_access_key`: TOS访问密钥
- `tos_secret_key`: TOS私密密钥
- `tos_region`: TOS区域

## 配置示例

### 火山方舟配置示例

```json
{
  "config_key": "volcano_ark_token",
  "config_value": "your-ark-token-here",
  "config_type": "token",
  "category": "volcano_ark",
  "description": "火山方舟API访问令牌",
  "is_encrypted": false,
  "is_active": true
}
```

### 火山引擎配置示例

```json
{
  "config_key": "volcano_engine_access_key",
  "config_value": "AKXXXXXXXXXXXXXXXXXX",
  "config_type": "key",
  "category": "volcano_engine",
  "description": "火山引擎访问密钥AK",
  "is_encrypted": false,
  "is_active": true
}
```

```json
{
  "config_key": "volcano_engine_secret_key",
  "config_value": "your-secret-key-here",
  "config_type": "key",
  "category": "volcano_engine",
  "description": "火山引擎私密密钥SK",
  "is_encrypted": true,
  "is_active": true
}
```

### TOS配置示例

```json
{
  "config_key": "tos_bucket_config",
  "config_value": "{\"bucket_name\": \"my-bucket\", \"region\": \"cn-beijing\", \"endpoint\": \"tos-cn-beijing.volces.com\"}",
  "config_type": "json",
  "category": "tos",
  "description": "TOS存储桶配置",
  "is_encrypted": false,
  "is_active": true
}
```

## 使用说明

### 1. 初始化配置

首先需要通过API创建必要的配置项。建议按照以下顺序创建：

1. 创建火山方舟配置
2. 创建火山引擎AK/SK
3. 创建TOS桶配置

### 2. 安全建议

- 对于敏感信息（如SK、密钥等），建议设置 `is_encrypted: true`
- 定期轮换密钥和token
- 不要在日志中打印敏感配置信息
- 生产环境应使用环境变量或专门的密钥管理服务

### 3. 配置读取

在应用中读取配置的示例代码：

```python
from sqlalchemy import select
from database import get_db, SystemConfig

async def get_config_value(config_key: str, db: AsyncSession) -> str:
    """根据配置键获取配置值"""
    result = await db.execute(
        select(SystemConfig).where(
            SystemConfig.config_key == config_key,
            SystemConfig.is_active == True
        )
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise ValueError(f"配置 {config_key} 不存在")
    
    return config.config_value

# 使用示例
async with async_session_maker() as db:
    ark_token = await get_config_value("volcano_ark_token", db)
    ak = await get_config_value("volcano_engine_access_key", db)
    sk = await get_config_value("volcano_engine_secret_key", db)
```

## 注意事项

1. **配置键唯一性**：每个 `config_key` 必须唯一
2. **分类规范**：建议使用预定义的分类名称，保持一致性
3. **加密存储**：当前 `is_encrypted` 字段仅作标记，实际加密需要另外实现
4. **备份**：重要配置应定期备份
5. **访问控制**：配置接口已集成用户认证，只有登录用户可以访问

## 扩展功能

未来可以添加的功能：

1. **配置加密**：实现真正的加密存储和解密读取
2. **配置版本控制**：记录配置的历史变更
3. **配置审计**：记录谁在什么时候修改了配置
4. **配置导入导出**：批量管理配置
5. **配置验证**：在保存前验证配置值的有效性

## 故障排查

### 问题：无法创建配置

- 检查配置键是否已存在
- 检查是否已登录并获取token
- 检查请求格式是否正确

### 问题：无法读取配置

- 检查配置是否存在
- 检查 `is_active` 字段是否为 true
- 检查用户是否有访问权限

### 问题：配置更新不生效

- 检查是否使用了正确的配置ID
- 检查更新后是否需要重启服务
- 检查缓存是否需要刷新

