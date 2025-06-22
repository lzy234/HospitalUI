import { Card, Divider } from 'antd';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useGlobalContext } from '../../context/GlobalContext';

export const ChatPanel = () => {
  const { state } = useGlobalContext();
  const { messages } = state;
  
  return (
    <Card 
      title="AI 助手对话" 
      extra={`${messages.length} 条消息`}
      style={{ height: '100%' }}
      bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <MessageList />
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: '16px' }}>
        <ChatInput />
      </div>
    </Card>
  );
}; 