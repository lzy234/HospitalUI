import { Card, Typography, Skeleton, Empty } from 'antd';
import { useGlobalContext } from '../context/GlobalContext';

export const ParseResultDisplay = () => {
  const { state } = useGlobalContext();
  const { transcript, loading } = state;
  
  if (loading.parse) {
    return (
      <Card title="解析结果">
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }
  
  if (!transcript) {
    return (
      <Card title="解析结果">
        <Empty description="等待视频解析完成" />
      </Card>
    );
  }
  
  return (
    <Card title="手术记录" extra={<span>{transcript.length} 字</span>}>
      <Typography.Paragraph
        style={{ maxHeight: '300px', overflow: 'auto' }}
        copyable
      >
        {transcript}
      </Typography.Paragraph>
    </Card>
  );
}; 