import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Row, Col, Card, Button, Alert, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import SystemConfig from './components/SystemConfig';

// 后端API地址
const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'register', 'config'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    }
  }, []);

  // 获取当前用户信息
  const fetchCurrentUser = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCurrentUser(response.data);
      setIsLoggedIn(true);
      setCurrentView('home');
    } catch (err) {
      console.error('获取用户信息失败:', err);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // 登录成功处理
  const handleLoginSuccess = (token) => {
    fetchCurrentUser(token);
  };

  // 注册成功处理
  const handleRegisterSuccess = (userData) => {
    setMessage(`注册成功！欢迎 ${userData.username}，请登录`);
    setCurrentView('login');
    setTimeout(() => setMessage(''), 3000);
  };

  // 登出处理
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('home');
    setMessage('已成功登出');
    setTimeout(() => setMessage(''), 3000);
  };

  // 测试API连接
  const testConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      setMessage(response.data.message);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('无法连接到后端服务器，请确保后端服务已启动');
      console.error('API连接错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 渲染主内容
  const renderContent = () => {
    if (currentView === 'login') {
      return (
        <Row className="justify-content-center">
          <Col md={6}>
            <Login 
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentView('register')}
            />
          </Col>
        </Row>
      );
    }

    if (currentView === 'register') {
      return (
        <Row className="justify-content-center">
          <Col md={6}>
            <Register 
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setCurrentView('login')}
            />
          </Col>
        </Row>
      );
    }

    if (currentView === 'config') {
      return (
        <Row>
          <Col>
            <SystemConfig />
          </Col>
        </Row>
      );
    }

    // 主页内容
    return (
      <>
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="text-center mb-4">
                  <h2>欢迎使用 HS ADK</h2>
                </Card.Title>
                <Card.Text className="text-center text-muted mb-4">
                  这是一个基于 React + Bootstrap + FastAPI 的 Web 应用程序
                </Card.Text>

                {isLoggedIn && currentUser && (
                  <Alert variant="info" className="text-center mb-3">
                    👋 你好，<strong>{currentUser.username}</strong>！
                  </Alert>
                )}

                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={testConnection}
                    disabled={loading}
                  >
                    {loading ? '连接中...' : '测试后端连接'}
                  </Button>
                </div>

                <div className="mt-4">
                  <h5>技术栈:</h5>
                  <ul>
                    <li><strong>前端框架:</strong> React 18</li>
                    <li><strong>UI库:</strong> React Bootstrap 5</li>
                    <li><strong>打包工具:</strong> Webpack 5</li>
                    <li><strong>后端框架:</strong> FastAPI</li>
                    <li><strong>数据库:</strong> SQLite</li>
                    <li><strong>认证:</strong> JWT Token</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col md={4}>
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>快速开发</Card.Title>
                <Card.Text>
                  使用现代化的技术栈，快速构建 Web 应用
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>响应式设计</Card.Title>
                <Card.Text>
                  基于 Bootstrap，完美适配各种设备屏幕
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>安全认证</Card.Title>
                <Card.Text>
                  基于 JWT 的用户认证系统，保障数据安全
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <div className="App">
      {/* 导航栏 */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#" onClick={() => setCurrentView('home')}>
            HS ADK
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => setCurrentView('home')}>首页</Nav.Link>
              {isLoggedIn && (
                <Nav.Link onClick={() => setCurrentView('config')}>系统配置</Nav.Link>
              )}
            </Nav>
            <Nav>
              {isLoggedIn ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                    {currentUser?.username || '用户'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item disabled>
                      {currentUser?.email}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      登出
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link onClick={() => setCurrentView('login')}>登录</Nav.Link>
                  <Nav.Link onClick={() => setCurrentView('register')}>注册</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 主内容 */}
      <Container className="mt-5">
        {/* 全局消息提示 */}
        {message && (
          <Alert variant="success" className="mb-3" dismissible onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-3" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {renderContent()}
      </Container>
    </div>
  );
}

export default App;

