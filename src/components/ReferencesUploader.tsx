import { Upload, List, Button, Popconfirm, Card, message } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { uploadReference } from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';

export const ReferencesUploader = () => {
  const { state, dispatch } = useGlobalContext();
  const { references } = state;
  
  const handleUpload = async (file: File) => {
    try {
      const response = await uploadReference(file);
      dispatch({
        type: 'ADD_REFERENCE',
        payload: {
          fileId: response.data.fileId,
          fileName: file.name,
          uploadTime: new Date().toISOString()
        }
      });
      message.success('文献上传成功');
    } catch (error) {
      message.error('上传失败');
    }
  };
  
  const removeReference = (fileId: string) => {
    // 这里需要在Context中添加删除action
    console.log('删除文献:', fileId);
  };
  
  return (
    <Card title="参考文献" extra={`${references.length} 个文件`}>
      <Upload.Dragger
        beforeUpload={(file) => { handleUpload(file); return false; }}
        accept=".pdf,.doc,.docx,.txt"
        showUploadList={false}
      >
        <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        <p>点击或拖拽文件到此区域上传</p>
        <p style={{ color: '#999' }}>支持 PDF、Word、TXT 格式</p>
      </Upload.Dragger>
      
      <List
        style={{ marginTop: 16 }}
        size="small"
        dataSource={references}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Popconfirm title="确定删除？" onConfirm={() => removeReference(item.fileId)}>
                <Button type="text" icon={<DeleteOutlined />} danger />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              title={item.fileName}
              description={new Date(item.uploadTime).toLocaleString()}
            />
          </List.Item>
        )}
      />
    </Card>
  );
}; 