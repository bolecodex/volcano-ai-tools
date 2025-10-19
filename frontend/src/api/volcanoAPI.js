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
}

// 创建单例实例
const volcanoAPI = new VolcanoAPIClient();

// 导出
export default volcanoAPI;

