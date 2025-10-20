"""
TOS (对象存储) 文件上传路由
提供文件上传到火山引擎TOS的HTTP接口
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import httpx
import hashlib
import os
from datetime import datetime
from signature_v4 import SignatureV4
import tos

router = APIRouter()


@router.get("/api/tos/status")
async def check_tos_status():
    """检查TOS上传服务状态"""
    return {
        "status": "ok",
        "service": "TOS Upload Service",
        "version": "1.0.0"
    }


class TOSUploadResponse(BaseModel):
    """TOS上传响应"""
    success: bool
    url: Optional[str] = None
    error: Optional[str] = None


async def upload_to_tos(
    file_data: bytes,
    file_name: str,
    bucket: str,
    region: str,
    access_key_id: str,
    secret_access_key: str
) -> dict:
    """
    上传文件到TOS
    
    Args:
        file_data: 文件二进制数据
        file_name: 文件名
        bucket: TOS Bucket名称
        region: TOS区域
        access_key_id: 访问密钥ID
        secret_access_key: 访问密钥密钥
        
    Returns:
        包含上传结果的字典
    """
    try:
        # 生成文件的唯一路径（使用时间戳和文件名）
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_hash = hashlib.md5(file_data[:1024]).hexdigest()[:8]
        file_ext = os.path.splitext(file_name)[1]
        object_key = f"uploads/{timestamp}_{file_hash}{file_ext}"
        
        # 构建TOS URL
        host = f"{bucket}.tos-{region}.volces.com"
        url = f"https://{host}/{object_key}"
        
        # 使用官方 TOS SDK
        auth = tos.auth.Auth(access_key_id, secret_access_key, region)
        client = tos.TosClient(
            auth=auth,
            endpoint=f"https://tos-{region}.volces.com"
        )
        
        # 上传文件
        response = client.put_object(
            Bucket=bucket,
            Key=object_key,
            Body=file_data,
            ContentType='application/octet-stream'
        )
        
        # TOS SDK 成功上传会返回 PutObjectResult 对象
        if response:
            return {
                'success': True,
                'url': url
            }
        else:
            return {
                'success': False,
                'error': "上传失败"
            }
                
    except Exception as e:
        return {
            'success': False,
            'error': f"上传异常: {str(e)}"
        }


@router.post("/api/tos/upload", response_model=TOSUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    bucket: str = Form(...),
    region: str = Form(...),
    access_key_id: str = Form(...),
    secret_access_key: str = Form(...)
):
    """
    上传文件到TOS
    
    请求参数:
    - file: 要上传的文件
    - bucket: TOS Bucket名称
    - region: TOS区域 (如: cn-beijing)
    - access_key_id: 访问密钥ID
    - secret_access_key: 访问密钥密钥
    
    返回:
    - success: 是否成功
    - url: 文件的TOS URL (成功时)
    - error: 错误信息 (失败时)
    """
    try:
        print(f"📥 收到TOS上传请求:")
        print(f"  - 文件名: {file.filename}")
        print(f"  - 内容类型: {file.content_type}")
        print(f"  - Bucket: {bucket}")
        print(f"  - Region: {region}")
        print(f"  - Access Key ID: {access_key_id[:10]}...{access_key_id[-4:] if len(access_key_id) > 14 else ''}")
        print(f"  - Secret Key: {'*' * 20}")
        # 读取文件数据
        file_data = await file.read()
        
        # 检查文件大小（限制为100MB）
        if len(file_data) > 100 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="文件大小超过100MB限制")
        
        # 上传到TOS
        result = await upload_to_tos(
            file_data=file_data,
            file_name=file.filename,
            bucket=bucket,
            region=region,
            access_key_id=access_key_id,
            secret_access_key=secret_access_key
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return TOSUploadResponse(
            success=True,
            url=result['url']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

