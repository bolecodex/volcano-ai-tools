"""
系统配置初始化脚本

用于初始化系统配置表的预定义配置项
运行此脚本前请确保：
1. 数据库已创建
2. 至少有一个已注册的用户账号（用于获取token）
"""

import asyncio
from database import async_session_maker, SystemConfig
from sqlalchemy import select

# 预定义的配置项模板
CONFIG_TEMPLATES = [
    # 火山方舟配置
    {
        "config_key": "volcano_ark_token",
        "config_value": "",  # 需要用户填写
        "config_type": "token",
        "category": "volcano_ark",
        "description": "火山方舟API访问令牌",
        "is_encrypted": False,
        "is_active": True
    },
    {
        "config_key": "volcano_ark_api_key",
        "config_value": "",
        "config_type": "key",
        "category": "volcano_ark",
        "description": "火山方舟API密钥",
        "is_encrypted": False,
        "is_active": True
    },
    {
        "config_key": "volcano_ark_endpoint",
        "config_value": "https://ark.cn-beijing.volces.com",
        "config_type": "string",
        "category": "volcano_ark",
        "description": "火山方舟服务端点URL",
        "is_encrypted": False,
        "is_active": True
    },
    
    # 火山引擎配置
    {
        "config_key": "volcano_engine_access_key",
        "config_value": "",  # AK
        "config_type": "key",
        "category": "volcano_engine",
        "description": "火山引擎访问密钥AK",
        "is_encrypted": False,
        "is_active": True
    },
    {
        "config_key": "volcano_engine_secret_key",
        "config_value": "",  # SK
        "config_type": "key",
        "category": "volcano_engine",
        "description": "火山引擎私密密钥SK（建议加密存储）",
        "is_encrypted": True,
        "is_active": True
    },
    {
        "config_key": "volcano_engine_region",
        "config_value": "cn-beijing",
        "config_type": "string",
        "category": "volcano_engine",
        "description": "火山引擎区域设置",
        "is_encrypted": False,
        "is_active": True
    },
    
    # TOS配置
    {
        "config_key": "tos_bucket_name",
        "config_value": "",
        "config_type": "string",
        "category": "tos",
        "description": "TOS存储桶名称",
        "is_encrypted": False,
        "is_active": True
    },
    {
        "config_key": "tos_bucket_endpoint",
        "config_value": "tos-cn-beijing.volces.com",
        "config_type": "string",
        "category": "tos",
        "description": "TOS存储桶端点",
        "is_encrypted": False,
        "is_active": True
    },
    {
        "config_key": "tos_access_key",
        "config_value": "",
        "config_type": "key",
        "category": "tos",
        "description": "TOS访问密钥（可与火山引擎AK共用）",
        "is_encrypted": False,
        "is_active": True
    },
    {
        "config_key": "tos_secret_key",
        "config_value": "",
        "config_type": "key",
        "category": "tos",
        "description": "TOS私密密钥（可与火山引擎SK共用，建议加密存储）",
        "is_encrypted": True,
        "is_active": True
    },
    {
        "config_key": "tos_region",
        "config_value": "cn-beijing",
        "config_type": "string",
        "category": "tos",
        "description": "TOS区域",
        "is_encrypted": False,
        "is_active": True
    }
]


async def init_system_configs():
    """初始化系统配置"""
    async with async_session_maker() as session:
        try:
            print("开始初始化系统配置...")
            created_count = 0
            skipped_count = 0
            
            for config_data in CONFIG_TEMPLATES:
                # 检查配置是否已存在
                result = await session.execute(
                    select(SystemConfig).where(
                        SystemConfig.config_key == config_data["config_key"]
                    )
                )
                existing_config = result.scalar_one_or_none()
                
                if existing_config:
                    print(f"⏭️  跳过已存在的配置: {config_data['config_key']}")
                    skipped_count += 1
                    continue
                
                # 创建新配置
                new_config = SystemConfig(**config_data)
                session.add(new_config)
                print(f"✅ 创建配置: {config_data['config_key']} ({config_data['category']})")
                created_count += 1
            
            await session.commit()
            
            print("\n" + "="*60)
            print(f"配置初始化完成！")
            print(f"新创建: {created_count} 个")
            print(f"已跳过: {skipped_count} 个")
            print("="*60)
            
            if created_count > 0:
                print("\n📝 提示：")
                print("1. 请通过API接口填写实际的token和key值")
                print("2. 敏感信息（如SK）建议启用加密存储")
                print("3. 可以通过 GET /api/configs/ 查看所有配置")
                print("4. 使用 PUT /api/configs/{id} 更新配置值")
            
        except Exception as e:
            print(f"❌ 初始化失败: {str(e)}")
            await session.rollback()
            raise


async def list_all_configs():
    """列出所有配置"""
    async with async_session_maker() as session:
        result = await session.execute(select(SystemConfig))
        configs = result.scalars().all()
        
        if not configs:
            print("\n当前没有任何配置项")
            return
        
        print("\n当前配置列表：")
        print("="*80)
        
        current_category = None
        for config in configs:
            if config.category != current_category:
                current_category = config.category
                print(f"\n【{current_category}】")
            
            value_display = config.config_value if config.config_value else "<未设置>"
            if config.is_encrypted and config.config_value:
                value_display = "****** (已加密)"
            
            status = "✅" if config.is_active else "❌"
            print(f"  {status} {config.config_key:30} = {value_display}")
            if config.description:
                print(f"     └─ {config.description}")
        
        print("="*80)


async def main():
    """主函数"""
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        await list_all_configs()
    else:
        await init_system_configs()


if __name__ == "__main__":
    asyncio.run(main())

