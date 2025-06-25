import axios, { AxiosResponse, AxiosError } from 'axios';
import { config } from '../config';

const apiClient = axios.create({
  baseURL: config.backendApiBase,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    console.log('发起请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('收到响应:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('响应错误:', error.response?.status, error.message);
    
    // 统一错误处理
    if (error.response?.status === 401) {
      // 处理未授权错误
      console.error('未授权访问，请检查认证信息');
    } else if (error.response?.status === 500) {
      console.error('服务器内部错误');
    } else if (error.code === 'ECONNABORTED') {
      console.error('请求超时');
    }
    
    return Promise.reject(error);
  }
);

// 视频上传接口
export const uploadVideo = async (file: File): Promise<{ taskId: string; url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/uploadVideo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`上传进度: ${percentCompleted}%`);
      }
    },
  });
  
  return response.data;
};

// 获取解析结果
export const getParseResult = async (taskId: string) => {
  const response = await apiClient.get(`/parseResult?taskId=${taskId}`);
  return response.data;
};

// 上传参考文献
export const uploadReference = async (file: File): Promise<{ fileId: string; fileName: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/uploadReference', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// LLM聊天接口
export const chatWithLLM = async (payload: {
  transcript: string;
  question: string;
  referenceIds: string[];
}): Promise<{ content: string }> => {
  try {
    const response = await axios.post(`${config.llmApiBase}/chat/completions`, {
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: `基于以下手术记录和参考文献回答问题：\n${payload.transcript}` 
        },
        { 
          role: 'user', 
          content: payload.question 
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }, {
      headers: { 
        'Authorization': `Bearer ${config.llmApiKey}`,
        'Content-Type': 'application/json',
      }
    });
    
    return {
      content: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error('LLM聊天请求失败:', error);
    throw error;
  }
};

// 导出报告
export const exportReport = async (data: {
  transcript: string;
  messages: Array<{ role: string; content: string; timestamp: number }>;
}): Promise<Blob> => {
  const response = await apiClient.post('/export/report', data, {
    responseType: 'blob',
  });
  
  return response.data;
};

// 健康检查
export const healthCheck = async (): Promise<{ status: string; timestamp: number }> => {
  const response = await apiClient.get('/health');
  return response.data;
}; 