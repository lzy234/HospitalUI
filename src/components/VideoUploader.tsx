import { useState } from 'react';
import { Upload, Button, Progress, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadVideo } from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';

export const VideoUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { dispatch } = useGlobalContext();
  
  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await uploadVideo(file);
      dispatch({ type: 'SET_VIDEO', payload: response.data });
      message.success('视频上传成功');
    } catch (error) {
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Upload
      beforeUpload={(file) => { handleUpload(file); return false; }}
      accept="video/*"
      showUploadList={false}
    >
      <Button icon={<UploadOutlined />} loading={uploading}>
        {uploading ? `上传中 ${progress}%` : '选择手术视频'}
      </Button>
    </Upload>
  );
}; 