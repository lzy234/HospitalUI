import { useEffect, useState } from 'react';
import { message } from 'antd';
import { getParseResult } from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';

export const useParsePolling = (taskId: string | null) => {
  const [polling, setPolling] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { dispatch } = useGlobalContext();
  const MAX_ATTEMPTS = 10;
  const INTERVAL = 3000;
  
  useEffect(() => {
    if (!taskId) return;
    
    const pollResult = async () => {
      try {
        const response = await getParseResult(taskId);
        if (response.data.transcript) {
          dispatch({ type: 'SET_TRANSCRIPT', payload: response.data.transcript });
          setPolling(false);
          return;
        }
      } catch (error) {
        console.error('轮询失败:', error);
      }
      
      setAttempt(prev => prev + 1);
      if (attempt >= MAX_ATTEMPTS) {
        setPolling(false);
        message.error('解析超时，请重试');
      }
    };
    
    setPolling(true);
    const timer = setInterval(pollResult, INTERVAL);
    
    return () => clearInterval(timer);
  }, [taskId, attempt, dispatch]);
  
  return { polling, attempt };
}; 