import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { storage } from '../utils/storage';

const VoiceDubbing = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('tts');
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, variant: '', message: '' });
  const [audioUrl, setAudioUrl] = useState('');
  const [audioHistory, setAudioHistory] = useState([]);

  // TTS 表单状态
  const [ttsForm, setTtsForm] = useState({
    text: '',
    voiceType: 'zh_female_cancan_mars_bigtts',
    encoding: 'mp3',
    speedRatio: 1.0,
    rate: 24000,
    loudnessRatio: 1.0,
    emotion: '',
    enableEmotion: false,
    explicitLanguage: '',
    model: ''
  });

  // 加载历史记录
  useEffect(() => {
    loadAudioHistory();
  }, []);

  const loadAudioHistory = () => {
    try {
      const history = storage.get('audio_history', []);
      setAudioHistory(history);
    } catch (error) {
      console.error('加载音频历史失败:', error);
    }
  };

  // 显示提示信息
  const showAlert = (variant, message) => {
    setAlertInfo({ show: true, variant, message });
    setTimeout(() => {
      setAlertInfo({ show: false, variant: '', message: '' });
    }, 5000);
  };

  // 处理TTS表单变化
  const handleTtsFormChange = (field, value) => {
    setTtsForm(prev => ({ ...prev, [field]: value }));
  };

  // 文本转语音
  const handleTextToSpeech = async () => {
    if (!ttsForm.text.trim()) {
      showAlert('warning', '请输入要合成的文本');
      return;
    }

    const credentials = storage.get('tts_credentials', {});
    if (!credentials.appId || !credentials.accessToken) {
      showAlert('warning', '请先在设置中配置语音合成的 AppID 和 Access Token');
      return;
    }

    setIsLoading(true);
    setAudioUrl('');

    try {
      const API_BASE_URL = window.location.protocol === 'file:' 
        ? 'http://localhost:3001' 
        : '';

      // 构建音频配置
      const audioConfig = {
        voice_type: ttsForm.voiceType,
        encoding: ttsForm.encoding,
        speed_ratio: parseFloat(ttsForm.speedRatio),
        rate: parseInt(ttsForm.rate),
        loudness_ratio: parseFloat(ttsForm.loudnessRatio)
      };

      // 添加情感参数
      if (ttsForm.enableEmotion && ttsForm.emotion) {
        audioConfig.emotion = ttsForm.emotion;
        audioConfig.enable_emotion = true;
      }

      // 添加语种参数
      if (ttsForm.explicitLanguage) {
        audioConfig.explicit_language = ttsForm.explicitLanguage;
      }

      const requestBody = {
        app: {
          appid: credentials.appId,
          token: credentials.accessToken,
          cluster: 'volcano_tts'
        },
        user: {
          uid: 'user_' + Date.now()
        },
        audio: audioConfig,
        request: {
          reqid: generateUUID(),
          text: ttsForm.text,
          operation: 'query'
        }
      };

      // 添加模型参数
      if (ttsForm.model) {
        requestBody.request.model = ttsForm.model;
      }

      const response = await fetch(`${API_BASE_URL}/api/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setAudioUrl(data.audioUrl);
        showAlert('success', '语音合成成功！');
        
        // 保存到历史记录
        const historyItem = {
          id: Date.now(),
          text: ttsForm.text.substring(0, 50) + (ttsForm.text.length > 50 ? '...' : ''),
          voiceType: ttsForm.voiceType,
          audioUrl: data.audioUrl,
          timestamp: new Date().toISOString()
        };
        
        const newHistory = [historyItem, ...audioHistory].slice(0, 10);
        setAudioHistory(newHistory);
        storage.set('audio_history', newHistory);
      } else {
        // 特殊处理401错误
        if (data.error && data.error.includes('401')) {
          showAlert('danger', 
            '❌ 认证失败(401)：AppID 或 Access Token 无效。' +
            '\n\n请检查：' +
            '\n1. AppID 和 Access Token 是否正确' +
            '\n2. Token 是否已过期' +
            '\n3. 是否已在豆包语音控制台开通服务' +
            '\n\n请前往【设置】重新配置凭证。'
          );
        } else {
          showAlert('danger', `语音合成失败: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('语音合成错误:', error);
      
      // 特殊处理401错误
      if (error.message && error.message.includes('401')) {
        showAlert('danger', 
          '❌ 认证失败(401)：AppID 或 Access Token 无效。\n\n' +
          '请检查：\n' +
          '• AppID 和 Access Token 是否正确\n' +
          '• Token 是否已过期\n' +
          '• 是否已在豆包语音控制台开通服务\n\n' +
          '请前往【设置】→【语音合成凭证配置】重新配置。'
        );
      } else {
        showAlert('danger', `语音合成请求失败: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 生成UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 下载音频
  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `audio_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 清除历史
  const handleClearHistory = () => {
    if (window.confirm('确定要清除所有历史记录吗？')) {
      setAudioHistory([]);
      storage.set('audio_history', []);
      showAlert('info', '历史记录已清除');
    }
  };

  return (
    <div className="voice-dubbing p-4">
      <h2 className="mb-4">
        <i className="bi bi-music-note-beamed me-2"></i>
        配音配乐
      </h2>

      {alertInfo.show && (
        <Alert variant={alertInfo.variant} dismissible onClose={() => setAlertInfo({ ...alertInfo, show: false })}>
          {alertInfo.message}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {/* 文本转语音 */}
        <Tab eventKey="tts" title={<><i className="bi bi-soundwave me-2"></i>文本转语音</>}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>合成文本 <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="请输入要合成的文本（建议小于300字符）"
                    value={ttsForm.text}
                    onChange={(e) => handleTtsFormChange('text', e.target.value)}
                    maxLength={1024}
                  />
                  <Form.Text className="text-muted">
                    {ttsForm.text.length}/1024 字符
                  </Form.Text>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>音色类型</Form.Label>
                      <Form.Select
                        value={ttsForm.voiceType}
                        onChange={(e) => handleTtsFormChange('voiceType', e.target.value)}
                      >
                        <optgroup label="女声">
                          <option value="zh_female_cancan_mars_bigtts">灿灿 (女声)</option>
                          <option value="zh_female_shuangkuaisisi_moon_bigtts">双快思思 (女声)</option>
                          <option value="zh_female_huanbaobao_mars_bigtts">欢宝宝 (女声)</option>
                        </optgroup>
                        <optgroup label="男声">
                          <option value="zh_male_wennuanahu_mars_bigtts">温暖阿虎 (男声)</option>
                          <option value="zh_male_yangguangshuaiqi_mars_bigtts">阳光帅气 (男声)</option>
                        </optgroup>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>音频格式</Form.Label>
                      <Form.Select
                        value={ttsForm.encoding}
                        onChange={(e) => handleTtsFormChange('encoding', e.target.value)}
                      >
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                        <option value="pcm">PCM</option>
                        <option value="ogg_opus">OGG Opus</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>语速 ({ttsForm.speedRatio}x)</Form.Label>
                      <Form.Range
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={ttsForm.speedRatio}
                        onChange={(e) => handleTtsFormChange('speedRatio', e.target.value)}
                      />
                      <Form.Text className="text-muted">0.5x ~ 2.0x</Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>采样率</Form.Label>
                      <Form.Select
                        value={ttsForm.rate}
                        onChange={(e) => handleTtsFormChange('rate', e.target.value)}
                      >
                        <option value="8000">8000 Hz</option>
                        <option value="16000">16000 Hz</option>
                        <option value="24000">24000 Hz</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>音量 ({ttsForm.loudnessRatio}x)</Form.Label>
                      <Form.Range
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={ttsForm.loudnessRatio}
                        onChange={(e) => handleTtsFormChange('loudnessRatio', e.target.value)}
                      />
                      <Form.Text className="text-muted">0.5x ~ 2.0x</Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="启用情感设置"
                        checked={ttsForm.enableEmotion}
                        onChange={(e) => handleTtsFormChange('enableEmotion', e.target.checked)}
                      />
                      {ttsForm.enableEmotion && (
                        <Form.Select
                          className="mt-2"
                          value={ttsForm.emotion}
                          onChange={(e) => handleTtsFormChange('emotion', e.target.value)}
                        >
                          <option value="">选择情感</option>
                          <option value="happy">开心</option>
                          <option value="sad">悲伤</option>
                          <option value="angry">愤怒</option>
                          <option value="fearful">恐惧</option>
                          <option value="surprised">惊讶</option>
                        </Form.Select>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>语种设置</Form.Label>
                      <Form.Select
                        value={ttsForm.explicitLanguage}
                        onChange={(e) => handleTtsFormChange('explicitLanguage', e.target.value)}
                      >
                        <option value="">自动检测</option>
                        <option value="zh-cn">中文</option>
                        <option value="en">英文</option>
                        <option value="ja">日文</option>
                        <option value="crosslingual">多语种</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>模型版本</Form.Label>
                      <Form.Select
                        value={ttsForm.model}
                        onChange={(e) => handleTtsFormChange('model', e.target.value)}
                      >
                        <option value="">默认版本</option>
                        <option value="seed-tts-1.1">Seed-TTS 1.1 (音质提升)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleTextToSpeech}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        合成中...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-play-circle me-2"></i>
                        开始合成
                      </>
                    )}
                  </Button>

                  {audioUrl && (
                    <Button
                      variant="success"
                      onClick={() => handleDownload(audioUrl, `tts_${Date.now()}.${ttsForm.encoding}`)}
                    >
                      <i className="bi bi-download me-2"></i>
                      下载音频
                    </Button>
                  )}
                </div>
              </Form>

              {audioUrl && (
                <div className="mt-4">
                  <h5>合成结果</h5>
                  <audio controls src={audioUrl} className="w-100 mt-2" />
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* 历史记录 */}
        <Tab eventKey="history" title={<><i className="bi bi-clock-history me-2"></i>历史记录</>}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">合成历史</h5>
                {audioHistory.length > 0 && (
                  <Button variant="outline-danger" size="sm" onClick={handleClearHistory}>
                    <i className="bi bi-trash me-2"></i>
                    清除历史
                  </Button>
                )}
              </div>

              {audioHistory.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3">暂无历史记录</p>
                </div>
              ) : (
                <div className="list-group">
                  {audioHistory.map((item) => (
                    <div key={item.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{item.text}</h6>
                          <small className="text-muted">
                            音色: {item.voiceType} | 
                            时间: {new Date(item.timestamp).toLocaleString('zh-CN')}
                          </small>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleDownload(item.audioUrl, `audio_${item.id}.mp3`)}
                        >
                          <i className="bi bi-download"></i>
                        </Button>
                      </div>
                      <audio controls src={item.audioUrl} className="w-100 mt-2" />
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default VoiceDubbing;

