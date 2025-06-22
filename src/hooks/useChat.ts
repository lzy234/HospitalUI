import { message } from 'antd';
import { chatWithLLM } from '../services/api';
import { Message } from '../types';
import { useGlobalContext } from '../context/GlobalContext';

// 简单的uuid生成函数
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useChat = () => {
  const { state, dispatch } = useGlobalContext();
  const { transcript, references } = state;
  
  const sendMessage = async (question: string) => {
    if (!question.trim()) return;
    
    // 添加用户消息
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: question,
      timestamp: Date.now()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    
    // 添加加载中的 AI 消息
    const aiMessage: Message = {
      id: uuidv4(),
      role: 'ai',
      content: '',
      timestamp: Date.now(),
      loading: true
    };
    dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
    
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'chat', value: true } });
      
      const response = await chatWithLLM({
        transcript,
        question,
        referenceIds: references.map(r => r.fileId)
      });
      
      // 更新 AI 消息内容
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: aiMessage.id,
          content: response.data.choices[0].message.content,
          loading: false
        }
      });
    } catch (error) {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: aiMessage.id,
          content: '抱歉，回答生成失败，请重试',
          loading: false
        }
      });
      message.error('对话失败');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'chat', value: false } });
    }
  };
  
  return { sendMessage };
}; 