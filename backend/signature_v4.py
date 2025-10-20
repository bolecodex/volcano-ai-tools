"""
火山引擎 Signature V4 签名生成器
参考文档: https://www.volcengine.com/docs/6348/69824
"""
import hmac
import hashlib
from datetime import datetime
from urllib.parse import urlparse, quote, parse_qs
from typing import Dict, Optional


class SignatureV4:
    """火山引擎API签名生成器"""
    
    def __init__(self, access_key_id: str, secret_access_key: str, service: str = 'cv', region: str = 'cn-north-1'):
        """
        初始化签名生成器
        
        Args:
            access_key_id: 访问密钥ID
            secret_access_key: 访问密钥密钥
            service: 服务类型 (cv: 视觉服务, tos: 对象存储)
            region: 区域
        """
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self.service = service
        self.region = region
    
    def sign(self, method: str, url: str, headers: Dict[str, str], body: Optional[str] = None) -> Dict[str, str]:
        """
        生成签名的主函数
        
        Args:
            method: HTTP方法
            url: 请求URL
            headers: 请求头
            body: 请求体
            
        Returns:
            包含签名的请求头字典
        """
        if self.service == 'tos':
            # 火山引擎 TOS 使用 TOS4-HMAC-SHA256 签名
            return self._sign_tos(method, url, headers, body)
        elif self.service == 'cv':
            # 火山引擎视觉服务使用简单的 HMAC-SHA256 签名
            return self._sign_cv(method, url, headers, body)
        else:
            # 其他服务使用 AWS4 签名
            return self._sign_aws4(method, url, headers, body)
    
    def _sign_tos(self, method: str, url: str, headers: Dict[str, str], body: Optional[str] = None) -> Dict[str, str]:
        """火山引擎 TOS 签名方法 - 使用 TOS4-HMAC-SHA256"""
        # 解析URL
        url_obj = urlparse(url)
        host = url_obj.hostname
        path = url_obj.path or '/'
        query_string = url_obj.query or ''
        
        # 获取当前时间
        now = datetime.utcnow()
        timestamp = now.strftime('%Y%m%dT%H%M%SZ')
        date_stamp = now.strftime('%Y%m%d')
        
        # 算法名称
        algorithm = 'TOS4-HMAC-SHA256'
        
        # 构建规范请求
        canonical_request = self._create_tos_canonical_request(
            method, path, query_string, headers, body, host
        )
        
        # 构建待签名字符串
        credential_scope = f"{date_stamp}/{self.region}/tos/request"
        string_to_sign = f"{algorithm}\n{timestamp}\n{credential_scope}\n{self._sha256_hash(canonical_request)}"
        
        # 计算签名密钥
        signing_key = self._calculate_tos_signing_key(date_stamp)
        
        # 计算签名
        signature = self._hmac_sha256_hex(string_to_sign, signing_key)
        
        # 构建Authorization头
        signed_headers = self._get_signed_headers(headers)
        authorization = f"{algorithm} Credential={self.access_key_id}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"
        
        # 返回签名后的headers
        return {
            **headers,
            'Host': host,
            'X-Tos-Date': timestamp,
            'Authorization': authorization
        }
    
    def _create_tos_canonical_request(self, method: str, path: str, query_string: str, 
                                     headers: Dict[str, str], body: Optional[str], host: str) -> str:
        """创建 TOS 规范请求"""
        http_method = method.upper()
        canonical_uri = self._get_canonical_uri(path)
        canonical_query_string = self._get_canonical_query_string(query_string)
        
        # TOS 规范头部
        canonical_headers = f"host:{host}\n"
        signed_headers = "host"
        
        # 计算负载哈希
        hashed_payload = self._sha256_hash(body or '')
        
        return '\n'.join([
            http_method,
            canonical_uri,
            canonical_query_string,
            canonical_headers,
            signed_headers,
            hashed_payload
        ])
    
    def _calculate_tos_signing_key(self, date_stamp: str) -> bytes:
        """计算 TOS 签名密钥"""
        k_date = self._hmac_sha256(date_stamp, self.secret_access_key.encode('utf-8'))
        k_region = self._hmac_sha256(self.region, k_date)
        k_service = self._hmac_sha256('tos', k_region)
        k_signing = self._hmac_sha256('request', k_service)
        return k_signing
    
    def _sign_cv(self, method: str, url: str, headers: Dict[str, str], body: Optional[str] = None) -> Dict[str, str]:
        """火山引擎视觉服务签名方法 - 使用火山引擎官方签名格式"""
        # 解析URL
        url_obj = urlparse(url)
        host = url_obj.hostname
        path = url_obj.path or '/'
        query_string = url_obj.query or ''
        
        # 获取当前时间
        now = datetime.utcnow()
        timestamp = now.strftime('%Y%m%dT%H%M%SZ')
        date_stamp = now.strftime('%Y%m%d')
        
        # 火山引擎使用 HMAC-SHA256 算法
        algorithm = 'HMAC-SHA256'
        
        # 构建规范请求
        canonical_request = self._create_volcano_canonical_request(
            method, path, query_string, headers, body, host, timestamp
        )
        
        # 构建待签名字符串
        credential_scope = f"{date_stamp}/{self.region}/cv/request"
        string_to_sign = f"{algorithm}\n{timestamp}\n{credential_scope}\n{self._sha256_hash(canonical_request)}"
        
        # 计算签名密钥 - 火山引擎的密钥派生方式
        k_date = self._hmac_sha256(date_stamp, self.secret_access_key.encode('utf-8'))
        k_region = self._hmac_sha256(self.region, k_date)
        k_service = self._hmac_sha256('cv', k_region)
        k_signing = self._hmac_sha256('request', k_service)
        
        # 计算签名
        signature = self._hmac_sha256_hex(string_to_sign, k_signing)
        
        # 构建Authorization头 - 火山引擎格式
        signed_headers = "host;x-date"
        authorization = f"{algorithm} Credential={self.access_key_id}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"
        
        # 返回签名后的headers
        return {
            **headers,
            'Host': host,
            'X-Date': timestamp,
            'Authorization': authorization
        }
    
    def _create_volcano_canonical_request(self, method: str, path: str, query_string: str, 
                                         headers: Dict[str, str], body: Optional[str], host: str, timestamp: str) -> str:
        """创建火山引擎规范请求"""
        http_method = method.upper()
        canonical_uri = self._get_canonical_uri(path)
        canonical_query_string = self._get_canonical_query_string(query_string)
        
        # 火山引擎规范头部 - 包含 host 和 x-date
        canonical_headers = f"host:{host}\nx-date:{timestamp}\n"
        signed_headers = "host;x-date"
        
        # 计算负载哈希
        hashed_payload = self._sha256_hash(body or '')
        
        return '\n'.join([
            http_method,
            canonical_uri,
            canonical_query_string,
            canonical_headers,
            signed_headers,
            hashed_payload
        ])
    
    def _create_cv_canonical_request(self, method: str, path: str, query_string: str, 
                                    headers: Dict[str, str], body: Optional[str], host: str, timestamp: str) -> str:
        """创建视觉服务规范请求"""
        http_method = method.upper()
        canonical_uri = self._get_canonical_uri(path)
        canonical_query_string = self._get_canonical_query_string(query_string)
        
        # 视觉服务规范头部 - 包含 host 和 x-amz-date
        canonical_headers = f"host:{host}\nx-amz-date:{timestamp}\n"
        signed_headers = "host;x-amz-date"
        
        # 计算负载哈希
        hashed_payload = self._sha256_hash(body or '')
        
        return '\n'.join([
            http_method,
            canonical_uri,
            canonical_query_string,
            canonical_headers,
            signed_headers,
            hashed_payload
        ])
    
    def _calculate_cv_signing_key(self, date_stamp: str) -> bytes:
        """计算视觉服务签名密钥"""
        k_date = self._hmac_sha256(date_stamp, self.secret_access_key.encode('utf-8'))
        k_region = self._hmac_sha256(self.region, k_date)
        k_service = self._hmac_sha256('cv', k_region)
        k_signing = self._hmac_sha256('request', k_service)
        return k_signing
    
    def _sign_aws4(self, method: str, url: str, headers: Dict[str, str], body: Optional[str] = None) -> Dict[str, str]:
        """AWS4 签名方法"""
        # 解析URL
        url_obj = urlparse(url)
        host = url_obj.hostname
        path = url_obj.path or '/'
        query_string = url_obj.query or ''
        
        # 获取当前时间
        now = datetime.utcnow()
        timestamp = self._get_timestamp(now)
        date_stamp = self._get_date_stamp(now)
        
        # AWS4-HMAC-SHA256 签名算法
        algorithm = 'AWS4-HMAC-SHA256'
        
        # 确保headers包含必要的字段
        sign_headers = {
            **headers,
            'Host': host,
            'X-Date': timestamp
        }
        
        # 如果有body，添加Content-Type
        if body and 'Content-Type' not in sign_headers:
            sign_headers['Content-Type'] = 'application/json'
        
        # Step 1: 创建规范请求
        canonical_request = self._create_canonical_request(
            method, path, query_string, sign_headers, body
        )
        
        # Step 2: 创建待签名字符串
        credential_scope = f"{date_stamp}/{self.region}/{self.service}/request"
        string_to_sign = self._create_string_to_sign(
            algorithm, timestamp, credential_scope, canonical_request
        )
        
        # Step 3: 计算签名
        signature = self._calculate_signature(date_stamp, string_to_sign)
        
        # Step 4: 构建Authorization头
        signed_headers = self._get_signed_headers(sign_headers)
        authorization = f"{algorithm} Credential={self.access_key_id}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"
        
        # 返回签名后的headers
        return {
            **sign_headers,
            'Authorization': authorization
        }
    
    def _create_canonical_request(self, method: str, path: str, query_string: str, 
                                  headers: Dict[str, str], body: Optional[str]) -> str:
        """创建规范请求"""
        http_method = method.upper()
        canonical_uri = self._get_canonical_uri(path)
        canonical_query_string = self._get_canonical_query_string(query_string)
        canonical_headers = self._get_canonical_headers(headers)
        signed_headers = self._get_signed_headers(headers)
        hashed_payload = self._hash_payload(body)
        
        return '\n'.join([
            http_method,
            canonical_uri,
            canonical_query_string,
            canonical_headers,
            signed_headers,
            hashed_payload
        ])
    
    def _create_string_to_sign(self, algorithm: str, timestamp: str, 
                              credential_scope: str, canonical_request: str) -> str:
        """创建待签名字符串"""
        hashed_canonical_request = self._sha256_hash(canonical_request)
        
        return '\n'.join([
            algorithm,
            timestamp,
            credential_scope,
            hashed_canonical_request
        ])
    
    def _calculate_signature(self, date_stamp: str, string_to_sign: str) -> str:
        """计算签名"""
        # 所有服务都使用 AWS4 签名
        secret_key = f"AWS4{self.secret_access_key}"
        k_date = self._hmac_sha256(date_stamp, secret_key)
        k_region = self._hmac_sha256(self.region, k_date)
        k_service = self._hmac_sha256(self.service, k_region)
        k_signing = self._hmac_sha256('request', k_service)
        
        return self._hmac_sha256_hex(string_to_sign, k_signing)
    
    def _get_canonical_uri(self, path: str) -> str:
        """获取规范URI"""
        if not path:
            return '/'
        # URI编码，但保留斜杠
        return quote(path, safe='/')
    
    def _get_canonical_query_string(self, query_string: str) -> str:
        """获取规范查询字符串"""
        if not query_string:
            return ''
        
        # 解析查询参数
        params = {}
        for param in query_string.split('&'):
            if '=' in param:
                key, value = param.split('=', 1)
                params[key] = value
            else:
                params[param] = ''
        
        # 按键名排序并编码
        return '&'.join(f"{quote(key, safe='')}={quote(value, safe='')}"
                       for key, value in sorted(params.items()))
    
    def _get_canonical_headers(self, headers: Dict[str, str]) -> str:
        """获取规范头部"""
        canonical_headers = {}
        
        # 转换为小写并排序
        for key, value in headers.items():
            lower_key = key.lower()
            # 去除前后空格，多个空格合并为一个
            canonical_value = ' '.join(str(value).split())
            canonical_headers[lower_key] = canonical_value
        
        # 按键名排序并格式化
        return ''.join(f"{key}:{value}\n" for key, value in sorted(canonical_headers.items()))
    
    def _get_signed_headers(self, headers: Dict[str, str]) -> str:
        """获取已签名头部列表"""
        return ';'.join(sorted(key.lower() for key in headers.keys()))
    
    def _hash_payload(self, body: Optional[str]) -> str:
        """计算请求体哈希"""
        if not body:
            return self._sha256_hash('')
        
        payload = body if isinstance(body, str) else str(body)
        return self._sha256_hash(payload)
    
    def _sha256_hash(self, data: str) -> str:
        """SHA256哈希"""
        return hashlib.sha256(data.encode('utf-8')).hexdigest()
    
    def _hmac_sha256(self, data: str, key) -> bytes:
        """HMAC-SHA256 (返回bytes)"""
        if isinstance(key, str):
            key = key.encode('utf-8')
        return hmac.new(key, data.encode('utf-8'), hashlib.sha256).digest()
    
    def _hmac_sha256_hex(self, data: str, key: bytes) -> str:
        """HMAC-SHA256 (返回十六进制字符串)"""
        return hmac.new(key, data.encode('utf-8'), hashlib.sha256).hexdigest()
    
    def _get_timestamp(self, date: datetime) -> str:
        """获取ISO 8601时间戳"""
        return date.strftime('%Y%m%dT%H%M%SZ')
    
    def _get_date_stamp(self, date: datetime) -> str:
        """获取日期戳 (YYYYMMDD)"""
        return date.strftime('%Y%m%d')



