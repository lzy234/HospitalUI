import axios from 'axios';
import { config } from '../config';

const apiClient = axios.create({
  baseURL: config.backendApiBase,
  timeout: 30000,
});

export const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/uploadVideo', formData);
};

export const getParseResult = async (taskId: string) => {
  return apiClient.get(`/parseResult?taskId=${taskId}`);
};

export const uploadReference = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/uploadReference', formData);
};

export const chatWithLLM = async (payload: {
  transcript: string;
  question: string;
  referenceIds: string[];
}) => {
  return axios.post(`${config.llmApiBase}/chat/completions`, {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: `基于以下手术记录和参考文献回答问题：\n${payload.transcript}` },
      { role: 'user', content: payload.question }
    ]
  }, {
    headers: { Authorization: `Bearer ${config.llmApiKey}` }
  });
}; 