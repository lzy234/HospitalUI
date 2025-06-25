// 环境配置接口
interface Config {
  // API 配置
  llmApiBase: string;
  llmApiKey: string;
  backendApiBase: string;
  
  // 应用配置
  appName: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  
  // 功能开关
  features: {
    enableVideoUpload: boolean;
    enableChat: boolean;
    enableExport: boolean;
    enableDebugLogs: boolean;
  };
  
  // 文件上传配置
  upload: {
    maxFileSize: number; // 字节
    allowedVideoTypes: string[];
    allowedDocumentTypes: string[];
  };
  
  // 超时配置
  timeouts: {
    apiRequest: number;
    videoUpload: number;
    parsePolling: number;
  };
}

export const config: Config = {
  // API 配置
  llmApiBase: import.meta.env.VITE_LLM_API_BASE || 'https://api.openai.com/v1',
  llmApiKey: import.meta.env.VITE_LLM_API_KEY || '',
  backendApiBase: import.meta.env.VITE_BACKEND_API_BASE || '/api',
  
  // 应用配置
  appName: import.meta.env.VITE_APP_NAME || '医院回顾系统',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: (import.meta.env.MODE as Config['environment']) || 'development',
  
  // 功能开关
  features: {
    enableVideoUpload: import.meta.env.VITE_ENABLE_VIDEO_UPLOAD !== 'false',
    enableChat: import.meta.env.VITE_ENABLE_CHAT !== 'false',
    enableExport: import.meta.env.VITE_ENABLE_EXPORT !== 'false',
    enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true' || import.meta.env.MODE === 'development',
  },
  
  // 文件上传配置
  upload: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '104857600'), // 100MB
    allowedVideoTypes: [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm'
    ],
    allowedDocumentTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ],
  },
  
  // 超时配置
  timeouts: {
    apiRequest: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    videoUpload: parseInt(import.meta.env.VITE_VIDEO_UPLOAD_TIMEOUT || '300000'), // 5分钟
    parsePolling: parseInt(import.meta.env.VITE_PARSE_POLLING_INTERVAL || '3000'), // 3秒
  },
};

// 配置验证函数
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // 检查必需的环境变量
  if (!config.llmApiKey && config.features.enableChat) {
    errors.push('VITE_LLM_API_KEY 是必需的，用于启用聊天功能');
  }
  
  if (!config.backendApiBase) {
    errors.push('VITE_BACKEND_API_BASE 是必需的');
  }
  
  // 检查URL格式
  try {
    if (config.backendApiBase.startsWith('http')) {
      new URL(config.backendApiBase);
    }
  } catch {
    errors.push('VITE_BACKEND_API_BASE 必须是有效的URL');
  }
  
  try {
    new URL(config.llmApiBase);
  } catch {
    errors.push('VITE_LLM_API_BASE 必须是有效的URL');
  }
  
  // 检查数值配置
  if (config.upload.maxFileSize <= 0) {
    errors.push('最大文件大小必须大于0');
  }
  
  if (config.timeouts.apiRequest <= 0) {
    errors.push('API请求超时时间必须大于0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 初始化配置
export const initializeConfig = (): void => {
  const validation = validateConfig();
  
  if (config.features.enableDebugLogs) {
    console.group('🔧 应用配置');
    console.log('环境:', config.environment);
    console.log('版本:', config.version);
    console.log('后端API:', config.backendApiBase);
    console.log('LLM API:', config.llmApiBase ? '已配置' : '未配置');
    console.log('功能开关:', config.features);
    console.groupEnd();
  }
  
  if (!validation.isValid) {
    console.group('❌ 配置错误');
    validation.errors.forEach(error => console.error(error));
    console.groupEnd();
    
    if (config.environment === 'production') {
      throw new Error('生产环境配置验证失败');
    }
  } else if (config.features.enableDebugLogs) {
    console.log('✅ 配置验证通过');
  }
};

// 获取API端点
export const getApiEndpoint = (path: string): string => {
  const baseUrl = config.backendApiBase.endsWith('/') 
    ? config.backendApiBase.slice(0, -1) 
    : config.backendApiBase;
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
};

// 检查功能是否启用
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 导出最大文件大小（格式化）
export const maxFileSizeFormatted = formatFileSize(config.upload.maxFileSize); 