/**
 * 火山引擎 API 客户端
 * 模拟 Electron IPC API，通过 HTTP 请求与后端通信
 */

const API_BASE_URL = 'http://localhost:8000';

class VolcanoAPIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * 生成图片 (Seedream 4.0)
   */
  async generateImages(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/images/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${requestData.apiKey}`
        },
        body: JSON.stringify({
          model: requestData.model,
          prompt: requestData.prompt,
          size: requestData.size,
          sequential_image_generation: requestData.sequential_image_generation,
          stream: requestData.stream,
          response_format: requestData.response_format,
          watermark: requestData.watermark,
          guidance_scale: requestData.guidance_scale,
          seed: requestData.seed,
          sequential_image_generation_options: requestData.sequential_image_generation_options
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 提交即梦 4.0 任务
   */
  async submitJimeng40Task(requestData) {
    try {
      // 构建请求体 - req_key 必须是 'jimeng_t2i_v40'
      const body = {
        req_key: 'jimeng_t2i_v40',
        prompt: requestData.prompt
      };
      
      // 添加可选字段
      if (requestData.image_urls && requestData.image_urls.length > 0) {
        body.image_urls = requestData.image_urls;
      }
      if (requestData.size) body.size = requestData.size;
      if (requestData.width && requestData.height) {
        body.width = requestData.width;
        body.height = requestData.height;
      }
      if (requestData.scale !== undefined) body.scale = requestData.scale;
      if (requestData.force_single !== undefined) body.force_single = requestData.force_single;
      if (requestData.min_ratio) body.min_ratio = requestData.min_ratio;
      if (requestData.max_ratio) body.max_ratio = requestData.max_ratio;

      console.log('📤 提交即梦4.0任务:', body);

      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncSubmitTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ 即梦4.0提交失败:', error);
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      console.log('✅ 即梦4.0提交成功，完整响应:', data);
      console.log('📋 解析后的 task_id:', data.task_id);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 查询即梦 4.0 任务
   */
  async queryJimeng40Task(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncGetResult/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify({
          req_key: 'jimeng_t2i_v40',
          task_id: requestData.task_id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ 查询即梦4.0任务失败:', error);
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      console.log('✅ 查询即梦4.0任务成功，完整响应:', data);
      console.log('📋 状态:', data.status);
      console.log('🖼️ 图片URLs:', data.image_urls);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 提交即梦 3.1 任务
   */
  async submitJimeng31Task(requestData) {
    return this.submitJimeng40Task(requestData);
  }

  /**
   * 查询即梦 3.1 任务
   */
  async queryJimeng31Task(requestData) {
    return this.queryJimeng40Task(requestData);
  }

  /**
   * 提交即梦图生图 3.0 任务
   */
  async submitJimengI2I30Task(requestData) {
    return this.submitJimeng40Task(requestData);
  }

  /**
   * 查询即梦图生图 3.0 任务
   */
  async queryJimengI2I30Task(requestData) {
    return this.queryJimeng40Task(requestData);
  }

  /**
   * 创建视频任务
   */
  async createVideoTask(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/video/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${requestData.apiKey}`
        },
        body: JSON.stringify({
          model: requestData.model,
          content: requestData.content,
          callback_url: requestData.callback_url,
          return_last_frame: requestData.return_last_frame
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 获取视频任务状态
   */
  async getVideoTask(taskId, apiKey) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/video/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 获取视频任务列表
   */
  async getVideoTasks(queryParams, apiKey) {
    try {
      const params = new URLSearchParams();
      if (queryParams.page_num) params.append('page_num', queryParams.page_num);
      if (queryParams.page_size) params.append('page_size', queryParams.page_size);
      if (queryParams.status) params.append('status', queryParams.status);
      if (queryParams.task_ids) params.append('task_ids', queryParams.task_ids);
      if (queryParams.model) params.append('model', queryParams.model);

      const response = await fetch(`${this.baseURL}/api/volcano/video/tasks?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 删除视频任务
   */
  async deleteVideoTask(taskId, apiKey) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/video/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 提交 Inpainting 任务
   */
  async submitInpaintingTask(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVProcess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify({
          req_key: requestData.req_key || 'inpainting_' + Date.now(),
          binary_data_base64: requestData.binary_data_base64,
          image_urls: requestData.image_urls,
          custom_prompt: requestData.custom_prompt,
          steps: requestData.steps,
          scale: requestData.scale,
          seed: requestData.seed,
          return_url: requestData.return_url
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 测试连接
   */
  async testConnection(apiKey) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 获取应用信息
   */
  async getAppInfo() {
    return {
      version: '1.0.0',
      platform: 'web',
      isElectron: false
    };
  }

  /**
   * 提交即梦3.0 Pro视频任务
   */
  async submitJimeng30ProVideoTask(requestData) {
    try {
      const body = {
        req_key: 'jimeng_ti2v_v30_pro'
      };

      // 添加参数
      if (requestData.prompt) body.prompt = requestData.prompt;
      if (requestData.binary_data_base64) body.binary_data_base64 = requestData.binary_data_base64;
      if (requestData.image_urls) body.image_urls = requestData.image_urls;
      if (requestData.seed !== undefined && requestData.seed !== -1) body.seed = requestData.seed;
      if (requestData.frames) body.frames = requestData.frames;
      if (requestData.aspect_ratio) body.aspect_ratio = requestData.aspect_ratio;

      console.log('📤 提交即梦3.0 Pro视频任务:', body);

      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncSubmitTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ 提交失败:', error);
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      console.log('✅ 提交成功:', data);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ 异常:', error);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 查询即梦3.0 Pro视频任务
   */
  async queryJimeng30ProVideoTask(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncGetResult/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify({
          req_key: 'jimeng_ti2v_v30_pro',
          task_id: requestData.task_id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 提交OmniHuman数字人视频任务
   */
  async submitOmniHumanVideoTask(requestData) {
    try {
      const body = {
        req_key: 'jimeng_realman_avatar_picture_create_video_omni_v15'
      };

      if (requestData.image_url) body.image_url = requestData.image_url;
      if (requestData.audio_url) body.audio_url = requestData.audio_url;
      if (requestData.mask_url) body.mask_url = requestData.mask_url;
      if (requestData.prompt) body.prompt = requestData.prompt;
      if (requestData.seed !== undefined && requestData.seed !== -1) body.seed = requestData.seed;
      if (requestData.pe_fast_mode !== undefined) body.pe_fast_mode = requestData.pe_fast_mode;

      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncSubmitTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 查询OmniHuman数字人视频任务
   */
  async queryOmniHumanVideoTask(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncGetResult/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify({
          req_key: 'jimeng_realman_avatar_picture_create_video_omni_v15',
          task_id: requestData.task_id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 上传文件到TOS
   */
  async uploadToTOS(file, tosConfig, accessKeyId, secretAccessKey) {
    try {
      // 参数验证
      console.log('🔍 验证上传参数:', {
        hasFile: !!file,
        fileName: file?.name,
        fileSize: file?.size,
        hasTosConfig: !!tosConfig,
        bucket: tosConfig?.bucket || '(空)',
        region: tosConfig?.region || '(空)',
        hasAccessKeyId: !!accessKeyId,
        accessKeyIdLength: accessKeyId?.length || 0,
        hasSecretAccessKey: !!secretAccessKey,
        secretAccessKeyLength: secretAccessKey?.length || 0,
        accessKeyIdType: typeof accessKeyId,
        secretAccessKeyType: typeof secretAccessKey
      });

      if (!file) {
        throw new Error('文件不能为空');
      }
      if (!tosConfig?.bucket) {
        throw new Error('TOS Bucket 未配置，请在设置页面配置');
      }
      if (!tosConfig?.region) {
        throw new Error('TOS Region 未配置，请在设置页面配置');
      }
      if (!accessKeyId || typeof accessKeyId !== 'string' || accessKeyId.trim() === '') {
        console.error('⚠️ AccessKeyId 验证失败:', { accessKeyId, type: typeof accessKeyId });
        throw new Error('AccessKeyId 未配置或无效，请在设置页面配置');
      }
      if (!secretAccessKey || typeof secretAccessKey !== 'string' || secretAccessKey.trim() === '') {
        console.error('⚠️ SecretAccessKey 验证失败:', { secretAccessKey, type: typeof secretAccessKey });
        throw new Error('SecretAccessKey 未配置或无效，请在设置页面配置');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', tosConfig.bucket);
      formData.append('region', tosConfig.region);
      formData.append('access_key_id', accessKeyId);
      formData.append('secret_access_key', secretAccessKey);

      console.log('📤 开始上传文件到TOS:', {
        fileName: file.name,
        fileSize: file.size,
        bucket: tosConfig.bucket,
        region: tosConfig.region
      });

      const response = await fetch(`${this.baseURL}/api/tos/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ TOS上传失败 (HTTP ' + response.status + '):', error);
        
        // 提取详细错误信息
        let errorMessage = '上传失败';
        if (error.detail) {
          if (Array.isArray(error.detail)) {
            // FastAPI 参数验证错误
            errorMessage = error.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join('; ');
          } else if (typeof error.detail === 'string') {
            errorMessage = error.detail;
          }
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

      const data = await response.json();
      console.log('✅ TOS上传成功:', data);
      return {
        success: true,
        url: data.url
      };
    } catch (error) {
      console.error('❌ TOS上传异常:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 提交即梦动作模仿任务
   */
  async submitJimengMotionImitationTask(requestData) {
    try {
      const body = {
        req_key: 'jimeng_imitator_ii2v',
        image_url: requestData.image_url,
        video_url: requestData.video_url
      };

      console.log('📤 提交即梦动作模仿任务:', body);

      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncSubmitTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ 提交失败:', error);
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      console.log('✅ 提交成功:', data);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ 异常:', error);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 查询即梦动作模仿任务
   */
  async queryJimengMotionImitationTask(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncGetResult/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify({
          req_key: 'jimeng_imitator_ii2v',
          task_id: requestData.task_id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ 查询失败:', error);
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      console.log('✅ 查询成功:', data);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ 异常:', error);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 提交经典动作模仿任务
   */
  async submitMotionImitationTask(requestData) {
    try {
      const body = {
        req_key: requestData.req_key || 'realman_avatar_imitator_v2v_gen_video',
        image_url: requestData.image_url,
        driving_video_info: requestData.driving_video_info
      };

      console.log('📤 提交经典动作模仿任务:', body);

      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncSubmitTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ 提交失败:', error);
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      console.log('✅ 提交成功:', data);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ 异常:', error);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 查询经典动作模仿任务
   */
  async queryMotionImitationTask(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncGetResult/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify({
          req_key: requestData.req_key || 'realman_avatar_imitator_v2v_gen_video',
          task_id: requestData.task_id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ 查询失败:', error);
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      console.log('✅ 查询成功:', data);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ 异常:', error);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 提交视频编辑任务
   */
  async submitVideoEditTask(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncSubmitTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify({
          req_key: requestData.req_key || 'dm_seedance_videoedit_tob',
          prompt: requestData.prompt,
          video_url: requestData.video_url,
          seed: requestData.seed,
          max_frame: requestData.max_frame
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ 视频编辑任务提交失败:', error);
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      console.log('✅ 视频编辑任务提交成功:', data);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ 视频编辑任务提交异常:', error);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 查询视频编辑任务
   */
  async queryVideoEditTask(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/api/volcano/visual/CVSync2AsyncGetResult/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': requestData.accessKeyId,
          'X-Secret-Access-Key': requestData.secretAccessKey
        },
        body: JSON.stringify({
          req_key: requestData.req_key || 'dm_seedance_videoedit_tob',
          task_id: requestData.task_id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ 视频编辑任务查询失败:', error);
        return {
          success: false,
          error: error
        };
      }

      const data = await response.json();
      console.log('✅ 视频编辑任务查询成功:', data);
      
      // 检查响应数据中是否包含错误信息
      if (data.error_code && data.error_code !== '10000') {
        console.error('❌ API返回错误:', data);
        return {
          success: false,
          error: {
            message: data.message || 'API返回错误',
            code: data.error_code
          }
        };
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('❌ 视频编辑任务查询异常:', error);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }
}

// 创建单例实例
const volcanoAPI = new VolcanoAPIClient();

// 导出
export default volcanoAPI;

