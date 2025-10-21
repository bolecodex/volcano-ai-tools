"""
火山引擎 API 服务封装
提供图片生成、视频生成、动作模仿、数字人等功能的API接口
"""
import httpx
import json
from typing import Dict, Any, Optional
from signature_v4 import SignatureV4


class VolcanoAPIService:
    """火山引擎API服务类"""
    
    def __init__(self):
        self.base_url = "https://ark.cn-beijing.volces.com"
        self.visual_base_url = "https://visual.volcengineapi.com"
    
    async def generate_images(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        生成图片 (Seedream 4.0)
        
        Args:
            request_data: 包含以下字段:
                - apiKey: API密钥
                - model: 模型名称
                - prompt: 提示词
                - size: 图片尺寸
                - 其他可选参数
                
        Returns:
            API响应数据
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/v3/images/generations",
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f"Bearer {request_data['apiKey']}"
                    },
                    json={
                        'model': request_data.get('model'),
                        'prompt': request_data.get('prompt'),
                        'size': request_data.get('size'),
                        'sequential_image_generation': request_data.get('sequential_image_generation'),
                        'stream': request_data.get('stream'),
                        'response_format': request_data.get('response_format'),
                        'watermark': request_data.get('watermark'),
                        'guidance_scale': request_data.get('guidance_scale'),
                        'seed': request_data.get('seed'),
                        'sequential_image_generation_options': request_data.get('sequential_image_generation_options')
                    },
                    timeout=60.0
                )
                
                if response.status_code != 200:
                    return {
                        'success': False,
                        'error': {
                            'message': f'HTTP {response.status_code}: {response.text}',
                            'code': 'API_ERROR'
                        }
                    }
                
                return {
                    'success': True,
                    'data': response.json()
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'message': str(e),
                    'code': 'API_ERROR'
                }
            }
    
    async def create_video_task(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建视频生成任务
        
        Args:
            request_data: 包含模型、内容、回调URL等参数
            
        Returns:
            任务创建结果
        """
        try:
            print(f"🚀 开始创建视频任务: model={request_data.get('model')}")
            print(f"📋 任务内容: {request_data.get('content')}")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/v3/contents/generations/tasks",
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f"Bearer {request_data['apiKey']}"
                    },
                    json={
                        'model': request_data.get('model'),
                        'content': request_data.get('content'),
                        'callback_url': request_data.get('callback_url'),
                        'return_last_frame': request_data.get('return_last_frame')
                    },
                    timeout=60.0
                )
                
                print(f"📡 API响应状态: {response.status_code}")
                print(f"📄 API响应内容: {response.text[:500]}...")
                
                if response.status_code != 200:
                    error_msg = f'HTTP {response.status_code}: {response.text}'
                    print(f"❌ API调用失败: {error_msg}")
                    return {
                        'success': False,
                        'error': {
                            'message': error_msg,
                            'code': 'VIDEO_API_ERROR'
                        }
                    }
                
                response_data = response.json()
                print(f"✅ 视频任务创建成功: {response_data}")
                return {
                    'success': True,
                    'data': response_data
                }
                
        except Exception as e:
            error_msg = f"视频任务创建异常: {type(e).__name__}: {str(e)}"
            print(f"❌ {error_msg}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': {
                    'message': error_msg,
                    'code': 'VIDEO_API_ERROR'
                }
            }
    
    async def get_video_task(self, task_id: str, api_key: str) -> Dict[str, Any]:
        """
        查询视频任务状态
        
        Args:
            task_id: 任务ID
            api_key: API密钥
            
        Returns:
            任务状态信息
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/v3/contents/generations/tasks/{task_id}",
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f"Bearer {api_key}"
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    return {
                        'success': False,
                        'error': {
                            'message': f'HTTP {response.status_code}: {response.text}',
                            'code': 'VIDEO_API_ERROR'
                        }
                    }
                
                return {
                    'success': True,
                    'data': response.json()
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'message': str(e),
                    'code': 'VIDEO_API_ERROR'
                }
            }
    
    async def get_video_tasks(self, query_params: Dict[str, Any], api_key: str) -> Dict[str, Any]:
        """
        批量查询视频任务
        
        Args:
            query_params: 查询参数
            api_key: API密钥
            
        Returns:
            任务列表
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/v3/contents/generations/tasks",
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f"Bearer {api_key}"
                    },
                    params=query_params,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    return {
                        'success': False,
                        'error': {
                            'message': f'HTTP {response.status_code}: {response.text}',
                            'code': 'VIDEO_API_ERROR'
                        }
                    }
                
                return {
                    'success': True,
                    'data': response.json()
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'message': str(e),
                    'code': 'VIDEO_API_ERROR'
                }
            }
    
    async def delete_video_task(self, task_id: str, api_key: str) -> Dict[str, Any]:
        """
        删除视频任务
        
        Args:
            task_id: 任务ID
            api_key: API密钥
            
        Returns:
            删除结果
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.base_url}/api/v3/contents/generations/tasks/{task_id}",
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f"Bearer {api_key}"
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    return {
                        'success': False,
                        'error': {
                            'message': f'HTTP {response.status_code}: {response.text}',
                            'code': 'VIDEO_API_ERROR'
                        }
                    }
                
                return {
                    'success': True,
                    'data': response.json()
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'message': str(e),
                    'code': 'VIDEO_API_ERROR'
                }
            }
    
    async def submit_visual_task(self, action: str, version: str, request_data: Dict[str, Any], 
                                 access_key_id: str, secret_access_key: str) -> Dict[str, Any]:
        """
        提交视觉服务任务（即梦系列、动作模仿、数字人等）
        
        Args:
            action: API动作名称
            version: API版本
            request_data: 请求数据
            access_key_id: 访问密钥ID
            secret_access_key: 访问密钥密钥
            
        Returns:
            任务提交结果
        """
        try:
            # 构建请求 - 只包含非None的字段
            clean_data = {k: v for k, v in request_data.items() if v is not None}
            
            url = f"{self.visual_base_url}/?Action={action}&Version={version}"
            body = json.dumps(clean_data)
            
            # 生成签名
            signer = SignatureV4(access_key_id, secret_access_key, service='cv', region='cn-north-1')
            headers = signer.sign('POST', url, {'Content-Type': 'application/json'}, body)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=headers,
                    content=body,
                    timeout=60.0
                )
                
                if response.status_code != 200:
                    return {
                        'success': False,
                        'error': {
                            'message': f'HTTP {response.status_code}: {response.text}',
                            'code': 'VISUAL_API_ERROR'
                        }
                    }
                
                # 解析火山引擎API响应
                api_response = response.json()
                
                # 火山引擎返回格式: { code: 10000, message: "xxx", data: {...} }
                if api_response.get('code') == 10000:
                    return {
                        'success': True,
                        'data': api_response.get('data', {})
                    }
                else:
                    return {
                        'success': False,
                        'error': {
                            'message': api_response.get('message', 'Unknown error'),
                            'code': str(api_response.get('code', 'UNKNOWN'))
                        }
                    }
                
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'message': str(e),
                    'code': 'VISUAL_API_ERROR'
                }
            }
    
    async def query_visual_task(self, action: str, version: str, request_data: Dict[str, Any],
                                access_key_id: str, secret_access_key: str) -> Dict[str, Any]:
        """
        查询视觉服务任务结果
        
        Args:
            action: API动作名称
            version: API版本
            request_data: 请求数据
            access_key_id: 访问密钥ID
            secret_access_key: 访问密钥密钥
            
        Returns:
            任务查询结果
        """
        try:
            print(f"🔍 开始查询视觉任务: action={action}, task_id={request_data.get('task_id')}")
            
            # 构建请求 - 只包含非None的字段
            clean_data = {k: v for k, v in request_data.items() if v is not None}
            print(f"📝 清理后的请求数据: {clean_data}")
            
            url = f"{self.visual_base_url}/?Action={action}&Version={version}"
            body = json.dumps(clean_data)
            print(f"🌐 请求URL: {url}")
            
            # 生成签名
            print(f"🔐 准备生成签名...")
            # 对于视频编辑任务，使用cv服务类型，区域使用官方文档指定的cn-north-1
            region = 'cn-north-1'  # 所有视觉任务统一使用cn-north-1区域以匹配官方文档要求
            signer = SignatureV4(access_key_id, secret_access_key, service='cv', region=region)
            headers = signer.sign('POST', url, {'Content-Type': 'application/json'}, body)
            print(f"✅ 签名生成成功")
            
            # 打印签名信息但不包含敏感内容
            masked_headers = {k: (v[:10] + '...' + v[-4:] if k == 'Authorization' and len(v) > 14 else v) 
                             for k, v in headers.items()}
            print(f"📋 请求头: {masked_headers}")
            
            # 发送请求
            print(f"📤 发送API请求...")
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.post(
                        url,
                        headers=headers,
                        content=body,
                        timeout=60.0  # 增加超时时间
                    )
                    print(f"📥 收到响应: HTTP {response.status_code}")
                    
                    # 打印响应内容（限制长度以保护隐私）
                    response_text = response.text
                    if len(response_text) > 500:
                        response_text = response_text[:500] + "... (truncated)"
                    print(f"📊 响应内容: {response_text}")
                    
                    if response.status_code != 200:
                        print(f"❌ 响应状态码错误: {response.status_code}")
                        return {
                            'success': False,
                            'error': {
                                'message': f'HTTP {response.status_code}: {response_text}',
                                'code': 'VISUAL_API_ERROR'
                            }
                        }
                    
                    # 解析火山引擎API响应
                    try:
                        api_response = response.json()
                        print(f"🔍 解析响应成功: code={api_response.get('code')}, message={api_response.get('message')}")
                    except json.JSONDecodeError as e:
                        print(f"❌ JSON解析错误: {str(e)}")
                        return {
                            'success': False,
                            'error': {
                                'message': f'Invalid JSON response: {str(e)}',
                                'code': 'JSON_PARSE_ERROR'
                            }
                        }
                    
                    # 火山引擎返回格式: { code: 10000, message: "xxx", data: {...} }
                    if api_response.get('code') == 10000:
                        print(f"✅ 查询成功，返回数据: {api_response.get('data')}")
                        return {
                            'success': True,
                            'data': api_response.get('data', {})
                        }
                    else:
                        print(f"❌ API返回错误码: {api_response.get('code')}, 消息: {api_response.get('message')}")
                        # 将错误信息也包含在data中，以便前端能够访问
                        error_data = {
                            'error_code': str(api_response.get('code', 'UNKNOWN')),
                            'message': api_response.get('message', 'Unknown error'),
                            'status': 'error'
                        }
                        return {
                            'success': True,  # 保持success为True，让前端能够处理错误信息
                            'data': error_data
                        }
                except httpx.RequestError as e:
                    print(f"❌ HTTP请求错误: {str(e)}")
                    return {
                        'success': False,
                        'error': {
                            'message': f'Request error: {str(e)}',
                            'code': 'HTTP_REQUEST_ERROR'
                        }
                    }
                except Exception as e:
                    print(f"❌ 请求处理异常: {type(e).__name__}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    return {
                        'success': False,
                        'error': {
                            'message': f'Request processing error: {str(e)}',
                            'code': 'PROCESSING_ERROR'
                        }
                    }
                
        except Exception as e:
            print(f"❌ 整个查询过程异常: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': {
                    'message': f'Query task failed: {str(e)}',
                    'code': 'VISUAL_API_ERROR'
                }
            }
    
    async def test_connection(self, api_key: str) -> Dict[str, Any]:
        """
        测试API连接
        
        Args:
            api_key: API密钥
            
        Returns:
            连接测试结果
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/v3/images/generations",
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f"Bearer {api_key}"
                    },
                    json={
                        'model': 'doubao-seedream-4-0-250828',
                        'prompt': 'test',
                        'size': '2K',
                        'sequential_image_generation': 'disabled',
                        'response_format': 'url',
                        'watermark': True
                    },
                    timeout=30.0
                )
                
                return {
                    'success': response.status_code in [200, 400],  # 400可能是预期的测试结果
                    'status': response.status_code,
                    'data': response.json() if response.status_code == 200 else None
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'message': str(e),
                    'code': 'CONNECTION_ERROR'
                }
            }

