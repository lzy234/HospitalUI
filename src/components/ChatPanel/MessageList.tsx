import { List, Avatar, Typography, Spin } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useGlobalContext } from '../../context/GlobalContext';

export const MessageList = () => {
  const { state } = useGlobalContext();
  const { messages } = state;
  
  return (
    <div style={{ height: '400px', overflow: 'auto', padding: '16px' }}>
      <List
        dataSource={messages}
        renderItem={(message) => (
          <List.Item style={{ border: 'none', padding: '8px 0' }}>
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  style={{
                    backgroundColor: message.role === 'user' ? '#1890ff' : '#52c41a'
                  }}
                />
              }
              title={message.role === 'user' ? '我' : 'AI 助手'}
              description={
                <div>
                  {message.loading ? (
                    <Spin size="small" style={{ marginRight: 8 }} />
                  ) : (
                    <Typography.Paragraph
                      style={{ marginBottom: 0 }}
                      copyable={message.role === 'ai'}
                    >
                      {message.content}
                    </Typography.Paragraph>
                  )}
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}; 