import ReactPlayer from 'react-player';
import { Empty, Card } from 'antd';

interface Props {
  url?: string;
  title?: string;
}

export const VideoPlayer = ({ url, title }: Props) => {
  if (!url) {
    return (
      <Card title="视频播放器">
        <Empty description="请先上传手术视频" />
      </Card>
    );
  }
  
  return (
    <Card title={title || '手术视频'}>
      <ReactPlayer
        url={url}
        width="100%"
        height="300px"
        controls
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
    </Card>
  );
}; 