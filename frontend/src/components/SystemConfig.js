import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Table, Modal, Form, Alert, Badge, 
  Spinner, Tabs, Tab, InputGroup, Row, Col 
} from 'react-bootstrap';
import axios from 'axios';

const API_BASE_URL = 'http://115.190.200.62:8000';

function SystemConfig() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentConfig, setCurrentConfig] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [formData, setFormData] = useState({
    config_key: '',
    config_value: '',
    config_type: 'string',
    category: 'general',
    description: '',
    is_encrypted: false,
    is_active: true
  });

  // 分类配置
  const categories = {
    all: { label: '全部', variant: 'primary' },
    volcano_ark: { label: '火山方舟', variant: 'danger' },
    volcano_engine: { label: '火山引擎', variant: 'warning' },
    tos: { label: 'TOS存储', variant: 'info' },
    general: { label: '通用配置', variant: 'secondary' }
  };

  useEffect(() => {
    fetchConfigs();
  }, [activeCategory]);

  // 获取配置列表
  const fetchConfigs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = activeCategory === 'all' 
        ? `${API_BASE_URL}/api/configs/`
        : `${API_BASE_URL}/api/configs/category/${activeCategory}`;
      
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setConfigs(response.data.configs || []);
    } catch (err) {
      setError('获取配置失败: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 打开创建模态框
  const handleCreateNew = () => {
    setModalMode('create');
    setFormData({
      config_key: '',
      config_value: '',
      config_type: 'string',
      category: activeCategory === 'all' ? 'general' : activeCategory,
      description: '',
      is_encrypted: false,
      is_active: true
    });
    setCurrentConfig(null);
    setShowModal(true);
  };

  // 打开编辑模态框
  const handleEdit = (config) => {
    setModalMode('edit');
    setCurrentConfig(config);
    setFormData({
      config_key: config.config_key,
      config_value: config.config_value || '',
      config_type: config.config_type,
      category: config.category,
      description: config.description || '',
      is_encrypted: config.is_encrypted,
      is_active: config.is_active
    });
    setShowModal(true);
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (modalMode === 'create') {
        await axios.post(`${API_BASE_URL}/api/configs/`, formData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setMessage('配置创建成功！');
      } else {
        await axios.put(`${API_BASE_URL}/api/configs/${currentConfig.id}`, {
          config_value: formData.config_value,
          config_type: formData.config_type,
          category: formData.category,
          description: formData.description,
          is_encrypted: formData.is_encrypted,
          is_active: formData.is_active
        }, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setMessage('配置更新成功！');
      }
      
      setShowModal(false);
      fetchConfigs();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除配置
  const handleDelete = async (config) => {
    if (!window.confirm(`确定要删除配置 "${config.config_key}" 吗？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/configs/${config.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage('配置删除成功！');
      fetchConfigs();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('删除失败: ' + (err.response?.data?.detail || err.message));
    }
  };

  // 渲染配置值（隐藏敏感信息）
  const renderConfigValue = (config) => {
    if (!config.config_value) {
      return <span className="text-muted">未设置</span>;
    }
    if (config.is_encrypted) {
      return <span className="text-muted">****** (已加密)</span>;
    }
    return config.config_value.length > 50 
      ? config.config_value.substring(0, 50) + '...'
      : config.config_value;
  };

  return (
    <div className="SystemConfig-container">
      <Card className="SystemConfig-card shadow-sm">
        <Card.Header className="SystemConfig-header">
          <Row>
            <Col>
              <h4 className="mb-0">🔧 系统配置管理</h4>
            </Col>
            <Col className="text-end">
              <Button 
                variant="primary" 
                onClick={handleCreateNew}
                className="SystemConfig-button--create"
              >
                ➕ 新建配置
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* 消息提示 */}
          {message && (
            <Alert variant="success" dismissible onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* 分类标签 */}
          <Tabs
            activeKey={activeCategory}
            onSelect={(k) => setActiveCategory(k)}
            className="SystemConfig-tabs mb-3"
          >
            {Object.entries(categories).map(([key, cat]) => (
              <Tab 
                key={key} 
                eventKey={key} 
                title={
                  <span>
                    <Badge bg={cat.variant}>{cat.label}</Badge>
                  </span>
                }
              />
            ))}
          </Tabs>

          {/* 配置列表 */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">加载中...</span>
              </Spinner>
            </div>
          ) : configs.length === 0 ? (
            <Alert variant="info">
              当前分类暂无配置项，点击"新建配置"添加。
            </Alert>
          ) : (
            <Table responsive hover className="SystemConfig-table">
              <thead>
                <tr>
                  <th>配置键</th>
                  <th>配置值</th>
                  <th>类型</th>
                  <th>分类</th>
                  <th>描述</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((config) => (
                  <tr key={config.id}>
                    <td>
                      <code className="SystemConfig-code">{config.config_key}</code>
                      {config.is_encrypted && (
                        <Badge bg="warning" className="ms-2">🔒</Badge>
                      )}
                    </td>
                    <td className="SystemConfig-value">
                      {renderConfigValue(config)}
                    </td>
                    <td>
                      <Badge bg="secondary">{config.config_type}</Badge>
                    </td>
                    <td>
                      <Badge bg={categories[config.category]?.variant || 'secondary'}>
                        {categories[config.category]?.label || config.category}
                      </Badge>
                    </td>
                    <td className="SystemConfig-description">
                      {config.description || '-'}
                    </td>
                    <td>
                      <Badge bg={config.is_active ? 'success' : 'danger'}>
                        {config.is_active ? '启用' : '禁用'}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEdit(config)}
                      >
                        编辑
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(config)}
                      >
                        删除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        className="SystemConfig-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' ? '📝 创建配置' : '✏️ 编辑配置'}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>配置键名 *</Form.Label>
              <Form.Control
                type="text"
                value={formData.config_key}
                onChange={(e) => setFormData({...formData, config_key: e.target.value})}
                placeholder="例如: volcano_ark_token"
                required
                disabled={modalMode === 'edit'}
              />
              <Form.Text className="text-muted">
                配置的唯一标识符，创建后不可修改
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>配置值</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.config_value}
                onChange={(e) => setFormData({...formData, config_value: e.target.value})}
                placeholder="输入配置值"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>配置类型</Form.Label>
                  <Form.Select
                    value={formData.config_type}
                    onChange={(e) => setFormData({...formData, config_type: e.target.value})}
                  >
                    <option value="string">字符串</option>
                    <option value="token">Token</option>
                    <option value="key">密钥</option>
                    <option value="json">JSON</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>分类</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="volcano_ark">火山方舟</option>
                    <option value="volcano_engine">火山引擎</option>
                    <option value="tos">TOS存储</option>
                    <option value="general">通用配置</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>描述</Form.Label>
              <Form.Control
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="配置的用途说明"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="🔒 加密存储（标记为敏感信息）"
                    checked={formData.is_encrypted}
                    onChange={(e) => setFormData({...formData, is_encrypted: e.target.checked})}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="✅ 启用此配置"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            取消
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SystemConfig;

