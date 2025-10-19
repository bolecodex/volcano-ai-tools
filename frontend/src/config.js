// API配置
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 认证配置
export const TOKEN_KEY = 'token';

// 获取认证头
export const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

