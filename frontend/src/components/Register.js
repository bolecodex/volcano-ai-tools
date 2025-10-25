import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';

const API_BASE_URL = 'http://115.190.200.62:8000';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (formData.username.length < 3) {
      setError('用户名至少需要3个字符');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密码至少需要6个字符');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // 注册成功，通知父组件
      if (onRegisterSuccess) {
        onRegisterSuccess(response.data);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.detail || '注册失败，请稍后重试');
      } else {
        setError('网络错误，请检查后端服务是否启动');
      }
      console.error('注册错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="register-card shadow-sm">
      <Card.Body>
        <Card.Title className="text-center mb-4">
          <h3>用户注册</h3>
        </Card.Title>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="registerUsername">
            <Form.Label>用户名</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="请输入用户名（至少3个字符）"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={3}
              maxLength={50}
            />
            <Form.Text className="text-muted">
              用户名长度需在3-50个字符之间
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerEmail">
            <Form.Label>邮箱地址</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="请输入邮箱地址"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerPassword">
            <Form.Label>密码</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="请输入密码（至少6个字符）"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
            <Form.Text className="text-muted">
              密码长度至少6个字符
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerConfirmPassword">
            <Form.Label>确认密码</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button 
              variant="success" 
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
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </Button>
          </div>
        </Form>

        <div className="text-center mt-3">
          <span className="text-muted">已有账号？</span>{' '}
          <Button 
            variant="link" 
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            立即登录
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Register;

