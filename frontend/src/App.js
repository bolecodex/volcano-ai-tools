import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Row, Col, Card, Button, Alert, Dropdown, Badge } from 'react-bootstrap';
import axios from 'axios';
// 原有组件
import Login from './components/Login';
import Register from './components/Register';
import SystemConfig from './components/SystemConfig';
// 火山AI组件
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import About from './components/About';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import MotionImitation from './components/MotionImitation';
import SmartSearch from './components/SmartSearch';
import InpaintingEditor from './components/InpaintingEditor';
import DigitalHuman from './components/DigitalHuman';
import VideoEditor from './components/VideoEditor';
import VoiceDubbing from './components/VoiceDubbing';

// 后端API地址
const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'register', 'config', 'volcano-ai'
  const [activeTab, setActiveTab] = useState('dashboard'); // 火山AI工作台的子标签
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [electronInfo, setElectronInfo] = useState({});

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    }

    // Check if we're running in Electron
    if (window.electronAPI) {
      setElectronInfo({
        platform: window.electronAPI.platform,
        isElectron: true
      });
    } else {
      setElectronInfo({
        platform: 'web',
        isElectron: false
      });
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

  // 渲染火山AI工作台内容
  const renderVolcanoAIContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard electronInfo={electronInfo} />;
      case 'image-generator':
        return <ImageGenerator />;
      case 'inpainting-editor':
        return <InpaintingEditor />;
      case 'video-editor':
        return <VideoEditor />;
      case 'video-generator':
        return <VideoGenerator />;
      case 'motion-imitation':
        return <MotionImitation />;
      case 'digital-human':
        return <DigitalHuman />;
      case 'voice-dubbing':
        return <VoiceDubbing />;
      case 'smart-search':
        return <SmartSearch />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About electronInfo={electronInfo} />;
      default:
        return <Dashboard electronInfo={electronInfo} />;
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

    if (currentView === 'volcano-ai') {
      return (
        <div className="App">
          <Header />
          
          <Container fluid>
            <Row>
              <Col md={3} className="p-0">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
              </Col>
              <Col md={9}>
                <div className="main-content">
                  {renderVolcanoAIContent()}
                </div>
              </Col>
            </Row>
          </Container>

          {/* Footer */}
          <footer className="bg-dark text-light text-center py-3 mt-4">
            <Container>
              <p className="mb-0">
                Built with ❤️ using React + Bootstrap
                {electronInfo.isElectron && (
                  <Badge bg="success" className="ms-2">
                    Running in Electron on {electronInfo.platform}
                  </Badge>
                )}
              </p>
            </Container>
          </footer>
        </div>
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
                  <h2>欢迎使用 HS ADK + 火山AI创作工坊</h2>
                </Card.Title>
                <Card.Text className="text-center text-muted mb-4">
                  集成认证系统和火山AI创作功能的 Web 应用程序
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
                    onClick={() => setCurrentView('volcano-ai')}
                  >
                    🎨 进入火山AI创作工坊
                  </Button>
                  
                  <Button 
                    variant="outline-primary" 
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
                    <li><strong>AI服务:</strong> 火山引擎 API</li>
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
                <Card.Title>🎨 AI创作</Card.Title>
                <Card.Text>
                  图片生成、视频生成、智能绘图等多种AI创作功能
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>🔒 安全认证</Card.Title>
                <Card.Text>
                  基于 JWT 的用户认证系统，保障数据安全
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>⚙️ 系统管理</Card.Title>
                <Card.Text>
                  配置管理、API密钥管理等系统功能
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  // 如果在火山AI视图中，不显示标准导航栏
  if (currentView === 'volcano-ai') {
    return renderContent();
  }

  return (
    <div className="App">
      {/* 导航栏 */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#" onClick={() => setCurrentView('home')}>
            HS ADK + 火山AI
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => setCurrentView('home')}>首页</Nav.Link>
              <Nav.Link onClick={() => setCurrentView('volcano-ai')}>
                🎨 火山AI创作工坊
              </Nav.Link>
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
