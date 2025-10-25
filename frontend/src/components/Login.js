import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: formData.username,
        password: formData.password
      });

      // 保存token到localStorage
      localStorage.setItem('token', response.data.access_token);
      
      // 通知父组件登录成功
      if (onLoginSuccess) {
        onLoginSuccess(response.data.access_token);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.detail || '登录失败，请检查用户名和密码');
      } else {
        setError('网络错误，请检查后端服务是否启动');
      }
      console.error('登录错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="login-card shadow-sm">
      <Card.Body>
        <Card.Title className="text-center mb-4">
          <h3>用户登录</h3>
        </Card.Title>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginUsername">
            <Form.Label>用户名</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>密码</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </div>
        </Form>

        <div className="text-center mt-3">
          <span className="text-muted">还没有账号？</span>{' '}
          <Button 
            variant="link" 
            onClick={onSwitchToRegister}
            disabled={loading}
          >
            立即注册
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Login;

