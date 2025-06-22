import { useState } from 'react';
import { Input, Button, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useChat } from '../../hooks/useChat';
import { useGlobalContext } from '../../context/GlobalContext';

export const ChatInput = () => {
  const [input, setInput] = useState('');
  const { sendMessage } = useChat();
  const { state } = useGlobalContext();
  const { loading } = state;
  
  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input.TextArea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="请输入您的问题..."
        autoSize={{ minRows: 1, maxRows: 4 }}
        disabled={loading.chat}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
        loading={loading.chat}
        disabled={!input.trim()}
      >
        发送
      </Button>
    </Space.Compact>
  );
}; 