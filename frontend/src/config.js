// API配置
// 使用相对路径，通过nginx代理访问后端API
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// 认证配置
export const TOKEN_KEY = 'token';

// 获取认证头
export const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

