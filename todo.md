# 手术复盘 UI 项目实施计划

## 阶段一：项目初始化 ⭐ (难度：简单)
- [ ] 1.1 初始化 Vite React+TypeScript 项目：`pnpm create vite hospital-review-ui --template react-ts`
  - **实现细节**：使用官方模板，自动配置 TypeScript、ESLint、Vite 构建
  - **步骤**：执行命令 → 进入目录 → `pnpm install`
  - **难度评估**：⭐ 简单，标准化操作
  
- [ ] 1.2 安装核心依赖：`pnpm add antd axios react-player html2canvas jspdf`
  - **实现细节**：
    - `antd`: UI 组件库，提供 Upload、Layout、Message 等组件
    - `axios`: HTTP 客户端，处理 API 请求
    - `react-player`: 视频播放器，支持多种格式
    - `html2canvas`: DOM 转图片，用于 PDF 导出
    - `jspdf`: PDF 生成库
  - **步骤**：检查版本兼容性 → 安装依赖 → 验证导入
  - **难度评估**：⭐ 简单，但需注意版本兼容
  
- [ ] 1.3 配置环境变量：创建 `.env.example` 和 `.env.local` 文件
  - **实现细节**：
    ```
    # .env.example
    VITE_LLM_API_BASE=https://api.openai.com/v1
    VITE_LLM_API_KEY=your_api_key_here
    VITE_BACKEND_API_BASE=/api
    ```
  - **步骤**：创建示例文件 → 复制为本地文件 → 配置真实值 → 添加到 .gitignore
  - **难度评估**：⭐ 简单，标准配置
  
- [ ] 1.4 配置全局样式：创建 `src/styles/index.css` 并引入 Ant Design
  - **实现细节**：
    ```css
    @import 'antd/dist/reset.css';
    
    * { box-sizing: border-box; }
    html, body, #root { height: 100%; margin: 0; }
    .ant-layout { min-height: 100vh; }
    ```
  - **步骤**：创建样式文件 → 在 main.tsx 引入 → 测试样式生效
  - **难度评估**：⭐ 简单，基础配置

## 阶段二：基础架构搭建 ⭐⭐ (难度：中等)
- [ ] 2.1 定义 TypeScript 类型：创建 `src/types/index.d.ts`
  - **实现细节**：
    ```typescript
    export interface VideoInfo {
      taskId: string;
      url: string;
      fileName: string;
    }
    
    export interface ParseResult {
      transcript: string;
      meta: Record<string, any>;
    }
    
    export interface ReferenceItem {
      fileId: string;
      fileName: string;
      uploadTime: string;
    }
    
    export interface Message {
      id: string;
      role: 'user' | 'ai';
      content: string;
      timestamp: number;
      loading?: boolean;
    }
    
    export interface GlobalState {
      video: VideoInfo | null;
      transcript: string;
      references: ReferenceItem[];
      messages: Message[];
      loading: {
        upload: boolean;
        parse: boolean;
        chat: boolean;
        export: boolean;
      };
    }
    ```
  - **步骤**：分析数据流 → 定义接口 → 导出类型 → 在组件中使用
  - **难度评估**：⭐⭐ 中等，需要前瞻性设计
  
- [ ] 2.2 配置环境读取：实现 `src/config/index.ts`
  - **实现细节**：
    ```typescript
    export const config = {
      llmApiBase: import.meta.env.VITE_LLM_API_BASE || '',
      llmApiKey: import.meta.env.VITE_LLM_API_KEY || '',
      backendApiBase: import.meta.env.VITE_BACKEND_API_BASE || '/api',
    };
    
    export const validateConfig = () => {
      const missing = Object.entries(config)
        .filter(([_, value]) => !value)
        .map(([key]) => key);
      
      if (missing.length > 0) {
        console.warn('Missing env variables:', missing);
      }
    };
    ```
  - **步骤**：读取环境变量 → 提供默认值 → 添加验证函数 → 导出配置
  - **难度评估**：⭐ 简单，工具函数
  
- [ ] 2.3 封装 API 服务：创建 `src/services/api.ts`
  - **实现细节**：
    ```typescript
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
    ```
  - **步骤**：配置 axios → 定义接口方法 → 添加错误处理 → 导出 API
  - **难度评估**：⭐⭐ 中等，需要处理不同 API 格式
  
- [ ] 2.4 搭建全局状态：实现 `src/context/GlobalContext.tsx`
  - **实现细节**：
    ```typescript
    import { createContext, useContext, useReducer } from 'react';
    import { GlobalState, Message } from '../types';
    
    const initialState: GlobalState = {
      video: null,
      transcript: '',
      references: [],
      messages: [],
      loading: { upload: false, parse: false, chat: false, export: false }
    };
    
    type Action = 
      | { type: 'SET_VIDEO'; payload: VideoInfo }
      | { type: 'SET_TRANSCRIPT'; payload: string }
      | { type: 'ADD_REFERENCE'; payload: ReferenceItem }
      | { type: 'ADD_MESSAGE'; payload: Message }
      | { type: 'SET_LOADING'; payload: { key: keyof GlobalState['loading']; value: boolean } };
    
    const globalReducer = (state: GlobalState, action: Action): GlobalState => {
      // reducer 实现
    };
    
    export const GlobalProvider = ({ children }) => {
      const [state, dispatch] = useReducer(globalReducer, initialState);
      return (
        <GlobalContext.Provider value={{ state, dispatch }}>
          {children}
        </GlobalContext.Provider>
      );
    };
    ```
  - **步骤**：设计 state 结构 → 定义 actions → 实现 reducer → 创建 Provider → 导出 hooks
  - **难度评估**：⭐⭐⭐ 复杂，状态管理核心
  
- [ ] 2.5 配置错误边界：创建 `ErrorBoundary` 组件
  - **实现细节**：
    ```typescript
    import { Component, ErrorInfo, ReactNode } from 'react';
    import { Result, Button } from 'antd';
    
    interface Props { children: ReactNode; }
    interface State { hasError: boolean; error?: Error; }
    
    export class ErrorBoundary extends Component<Props, State> {
      constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
      }
    
      static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
      }
    
      componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }
    
      render() {
        if (this.state.hasError) {
          return (
            <Result
              status="error"
              title="页面出错了"
              subTitle="请刷新页面重试"
              extra={<Button onClick={() => window.location.reload()}>刷新页面</Button>}
            />
          );
        }
        return this.props.children;
      }
    }
    ```
  - **步骤**：继承 Component → 实现错误捕获 → 设计错误 UI → 添加恢复机制
  - **难度评估**：⭐⭐ 中等，类组件模式

## 阶段三：核心功能组件 ⭐⭐⭐ (难度：复杂)
### 3.1 视频处理模块 ⭐⭐
- [ ] 3.1.1 实现视频上传组件：`components/VideoUploader.tsx`
  - **实现细节**：
    ```typescript
    import { Upload, Button, Progress, message } from 'antd';
    import { UploadOutlined } from '@ant-design/icons';
    import { uploadVideo } from '../services/api';
    
    export const VideoUploader = () => {
      const [uploading, setUploading] = useState(false);
      const [progress, setProgress] = useState(0);
      
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
    ```
  - **步骤**：设计上传 UI → 处理文件选择 → 调用上传 API → 更新进度 → 错误处理
  - **难度评估**：⭐⭐ 中等，文件上传常见功能
  
- [ ] 3.1.2 实现视频播放组件：`components/VideoPlayer.tsx`
  - **实现细节**：
    ```typescript
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
    ```
  - **步骤**：检查视频 URL → 渲染播放器 → 配置播放选项 → 处理空状态
  - **难度评估**：⭐ 简单，组件封装
  
- [ ] 3.1.3 实现解析轮询逻辑：`hooks/useParsePolling.ts`
  - **实现细节**：
    ```typescript
    import { useEffect, useState } from 'react';
    import { getParseResult } from '../services/api';
    
    export const useParsePolling = (taskId: string | null) => {
      const [polling, setPolling] = useState(false);
      const [attempt, setAttempt] = useState(0);
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
      }, [taskId, attempt]);
      
      return { polling, attempt };
    };
    ```
  - **步骤**：设置轮询定时器 → 调用解析 API → 检查结果 → 处理超时 → 清理定时器
  - **难度评估**：⭐⭐⭐ 复杂，异步轮询逻辑
  
- [ ] 3.1.4 实现解析结果展示：`components/ParseResultDisplay.tsx`
  - **实现细节**：
    ```typescript
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
    ```
  - **步骤**：读取解析状态 → 渲染加载态 → 显示文本内容 → 添加复制功能
  - **难度评估**：⭐ 简单，数据展示组件

### 3.2 文献管理模块 ⭐⭐
- [ ] 3.2.1 实现文献上传组件：`components/ReferencesUploader.tsx`
  - **实现细节**：
    ```typescript
    import { Upload, List, Button, Popconfirm } from 'antd';
    import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
    import { uploadReference } from '../services/api';
    
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
    ```
  - **步骤**：设计拖拽上传 → 处理多文件 → 展示文件列表 → 支持删除操作
  - **难度评估**：⭐⭐ 中等，多文件管理

### 3.3 AI 对话模块 ⭐⭐⭐
- [ ] 3.3.1 实现对话逻辑：`hooks/useChat.ts`
  - **实现细节**：
    ```typescript
    import { useState } from 'react';
    import { v4 as uuidv4 } from 'uuid';
    import { chatWithLLM } from '../services/api';
    import { Message } from '../types';
    
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
    ```
  - **步骤**：验证输入 → 添加用户消息 → 显示加载状态 → 调用 LLM → 更新 AI 回复
  - **难度评估**：⭐⭐⭐ 复杂，异步状态管理
  
- [ ] 3.3.2 实现消息列表：`components/ChatPanel/MessageList.tsx`
  - **实现细节**：
    ```typescript
    import { List, Avatar, Typography, Spin } from 'antd';
    import { UserOutlined, RobotOutlined } from '@ant-design/icons';
    
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
    ```
  - **步骤**：渲染消息列表 → 区分用户/AI 角色 → 显示加载状态 → 添加时间戳
  - **难度评估**：⭐⭐ 中等，UI 交互组件
  
- [ ] 3.3.3 实现输入框：`components/ChatPanel/ChatInput.tsx`
  - **实现细节**：
    ```typescript
    import { Input, Button, Space } from 'antd';
    import { SendOutlined } from '@ant-design/icons';
    import { useChat } from '../../hooks/useChat';
    
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
      
      const handleKeyPress = (e: KeyboardEvent) => {
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
            onKeyPress={handleKeyPress}
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
    ```
  - **步骤**：绑定输入状态 → 处理发送逻辑 → 支持快捷键 → 禁用状态管理
  - **难度评估**：⭐⭐ 中等，表单交互
  
- [ ] 3.3.4 整合对话面板：`components/ChatPanel/ChatPanel.tsx`
  - **实现细节**：
    ```typescript
    import { Card, Divider } from 'antd';
    import { MessageList } from './MessageList';
    import { ChatInput } from './ChatInput';
    
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
    ```
  - **步骤**：组合消息列表和输入框 → 设计布局结构 → 添加统计信息
  - **难度评估**：⭐ 简单，组件组合

### 3.4 报告导出模块 ⭐⭐⭐
- [ ] 3.4.1 实现 PDF 导出：`components/ReportExporter.tsx`
  - **实现细节**：
    ```typescript
    import { Button, message } from 'antd';
    import { DownloadOutlined } from '@ant-design/icons';
    import html2canvas from 'html2canvas';
    import jsPDF from 'jspdf';
    
    export const ReportExporter = () => {
      const { state, dispatch } = useGlobalContext();
      const { video, transcript, messages, references } = state;
      
      const exportToPDF = async () => {
        if (!transcript) {
          message.warning('请先解析视频内容');
          return;
        }
        
        try {
          dispatch({ type: 'SET_LOADING', payload: { key: 'export', value: true } });
          
          // 创建临时的报告内容 DOM
          const reportElement = document.getElementById('report-area');
          if (!reportElement) {
            throw new Error('报告区域不存在');
          }
          
          // 使用 html2canvas 生成图片
          const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true
          });
          
          // 创建 PDF
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = 190;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(
            canvas.toDataURL('image/png'),
            'PNG',
            10,
            10,
            imgWidth,
            imgHeight
          );
          
          // 添加文本内容
          pdf.setFontSize(16);
          pdf.text('手术复盘报告', 10, imgHeight + 30);
          
          pdf.setFontSize(12);
          pdf.text(`生成时间: ${new Date().toLocaleString()}`, 10, imgHeight + 40);
          pdf.text(`视频文件: ${video?.fileName || '未知'}`, 10, imgHeight + 50);
          pdf.text(`对话记录: ${messages.length} 条`, 10, imgHeight + 60);
          pdf.text(`参考文献: ${references.length} 个`, 10, imgHeight + 70);
          
          // 下载 PDF
          pdf.save(`手术复盘报告_${new Date().toISOString().slice(0, 10)}.pdf`);
          message.success('报告导出成功');
        } catch (error) {
          console.error('PDF 导出失败:', error);
          message.error('导出失败，请重试');
        } finally {
          dispatch({ type: 'SET_LOADING', payload: { key: 'export', value: false } });
        }
      };
      
      return (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportToPDF}
          loading={state.loading.export}
          disabled={!transcript}
          size="large"
          block
        >
          导出 PDF 报告
        </Button>
      );
    };
    ```
  - **步骤**：验证数据完整性 → 捕获 DOM 截图 → 创建 PDF 文档 → 添加文本信息 → 触发下载
  - **难度评估**：⭐⭐⭐ 复杂，DOM 操作和文件生成

## 阶段四：界面整合 ⭐⭐ (难度：中等)
- [ ] 4.1 设计主界面布局：实现 `App.tsx` 使用 Ant Design Layout
  - **实现细节**：
    ```typescript
    import { Layout, Row, Col, Typography } from 'antd';
    import { GlobalProvider } from './context/GlobalContext';
    import { ErrorBoundary } from './components/ErrorBoundary';
    import { VideoUploader } from './components/VideoUploader';
    import { VideoPlayer } from './components/VideoPlayer';
    import { ReferencesUploader } from './components/ReferencesUploader';
    import { ParseResultDisplay } from './components/ParseResultDisplay';
    import { ChatPanel } from './components/ChatPanel/ChatPanel';
    import { ReportExporter } from './components/ReportExporter';
    
    const { Header, Content, Footer } = Layout;
    
    function App() {
      return (
        <ErrorBoundary>
          <GlobalProvider>
            <Layout style={{ minHeight: '100vh' }}>
              <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  手术复盘系统
                </Typography.Title>
              </Header>
              
              <Content style={{ padding: '24px' }}>
                <div id="report-area">
                  <Row gutter={24} style={{ height: '100%' }}>
                    <Col span={10}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <VideoUploader />
                        <VideoPlayer />
                        <ReferencesUploader />
                      </div>
                    </Col>
                    
                    <Col span={14}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                        <ParseResultDisplay />
                        <div style={{ flex: 1 }}>
                          <ChatPanel />
                        </div>
                        <ReportExporter />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Content>
              
              <Footer style={{ textAlign: 'center' }}>
                手术复盘系统 ©2024 - 智能医疗解决方案
              </Footer>
            </Layout>
          </GlobalProvider>
        </ErrorBoundary>
      );
    }
    
    export default App;
    ```
  - **步骤**：搭建 Layout 结构 → 组织组件层次 → 设置响应式栅格 → 添加样式调整
  - **难度评估**：⭐⭐ 中等，布局设计和组件组合
  
- [ ] 4.2 配置左右分栏：左侧视频和文献，右侧解析和对话
  - **实现细节**：
    - 左侧栏（40%）：视频上传 → 视频播放 → 文献管理，垂直排列
    - 右侧栏（60%）：解析结果 → 对话面板 → 导出按钮，垂直布局
    - 使用 Ant Design Row/Col 组件，gutter 间距 24px
    - 添加 CSS 样式确保各区域高度分配合理
  - **步骤**：计算栏位比例 → 设置组件顺序 → 调整间距样式 → 测试响应式效果
  - **难度评估**：⭐ 简单，CSS 布局
  
- [ ] 4.3 设置导出区域：添加 `id="report-area"` 标识
  - **实现细节**：
    ```typescript
    // 在 Content 内的主要区域包裹 div
    <div id="report-area" style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
      {/* 所有需要导出的内容 */}
    </div>
    
    // 在 ReportExporter 中通过 document.getElementById('report-area') 获取
    const reportElement = document.getElementById('report-area');
    ```
  - **步骤**：确定导出范围 → 添加 ID 标识 → 设置导出样式 → 验证截图效果
  - **难度评估**：⭐ 简单，DOM 标识
  
- [ ] 4.4 应用主题配置：使用 `ConfigProvider` 统一样式
  - **实现细节**：
    ```typescript
    import { ConfigProvider, theme } from 'antd';
    import zhCN from 'antd/locale/zh_CN';
    
    const customTheme = {
      algorithm: theme.defaultAlgorithm,
      token: {
        colorPrimary: '#1890ff',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        borderRadius: 6,
        fontSize: 14,
      },
    };
    
    function App() {
      return (
        <ConfigProvider theme={customTheme} locale={zhCN}>
          {/* 应用内容 */}
        </ConfigProvider>
      );
    }
    ```
  - **步骤**：定义主题配置 → 设置中文语言包 → 包裹应用根组件 → 验证主题生效
  - **难度评估**：⭐ 简单，配置应用

## 阶段五：质量保证 ⭐⭐ (难度：中等)
- [ ] 5.1 代码规范检查：配置 ESLint 和 Prettier
  - **实现细节**：
    ```json
    // .eslintrc.json
    {
      "extends": [
        "eslint:recommended",
        "@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "prettier"
      ],
      "rules": {
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "prefer-const": "error"
      }
    }
    
    // .prettierrc
    {
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": true,
      "printWidth": 100,
      "tabWidth": 2
    }
    
    // package.json scripts
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx}"
    ```
  - **步骤**：安装 ESLint/Prettier → 配置规则文件 → 添加脚本命令 → 修复代码问题
  - **难度评估**：⭐ 简单，工具配置
  
- [ ] 5.2 功能测试：端到端流程验证
  - **实现细节**：
    - **上传测试**：选择视频文件 → 验证上传进度 → 检查成功状态
    - **解析测试**：等待轮询完成 → 验证文本显示 → 检查错误处理
    - **对话测试**：输入问题 → 验证 API 调用 → 检查回答显示
    - **文献测试**：上传多个文件 → 验证列表更新 → 测试删除功能
    - **导出测试**：点击导出按钮 → 验证 PDF 生成 → 检查文件下载
  - **步骤**：准备测试数据 → 执行完整流程 → 记录问题点 → 修复发现的 bug
  - **难度评估**：⭐⭐ 中等，需要模拟真实场景
  
- [ ] 5.3 错误处理：完善异常捕获和用户提示
  - **实现细节**：
    ```typescript
    // API 错误处理
    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          message.error('认证失败，请检查 API Key');
        } else if (error.response?.status >= 500) {
          message.error('服务器错误，请稍后重试');
        } else {
          message.error(error.message || '请求失败');
        }
        return Promise.reject(error);
      }
    );
    
    // 组件错误边界
    // 网络错误重试机制
    // 加载状态管理
    ```
  - **步骤**：识别错误场景 → 添加错误捕获 → 设计友好提示 → 测试错误恢复
  - **难度评估**：⭐⭐⭐ 复杂，需要全面考虑错误情况
  
- [ ] 5.4 性能优化：组件懒加载和资源优化
  - **实现细节**：
    ```typescript
    // 路由懒加载
    const ChatPanel = lazy(() => import('./components/ChatPanel/ChatPanel'));
    
    // 图片懒加载
    // 大文件分片上传
    // 虚拟滚动优化
    // Bundle 分析和优化
    
    // 缓存策略
    const memoizedComponent = useMemo(() => <ExpensiveComponent />, [dependencies]);
    ```
  - **步骤**：分析性能瓶颈 → 实施优化措施 → 测量优化效果 → 调整优化策略
  - **难度评估**：⭐⭐⭐ 复杂，需要性能分析经验

## 阶段六：项目交付 ⭐ (难度：简单)
- [ ] 6.1 完善文档：更新 `README.md` 包含使用说明
  - **实现细节**：
    ```markdown
    # 手术复盘 UI 系统
    
    ## 功能概述
    - 手术视频上传和播放
    - 视频内容智能解析
    - AI 辅助问答对话
    - 医学文献参考
    - PDF 报告导出
    
    ## 技术栈
    - React 18 + TypeScript
    - Ant Design 5.x
    - Vite 构建工具
    - React Player 视频播放
    - html2canvas + jsPDF 导出
    
    ## 安装运行
    ```bash
    # 安装依赖
    pnpm install
    
    # 配置环境变量
    cp .env.example .env.local
    # 编辑 .env.local 填入真实 API 配置
    
    # 启动开发服务器
    pnpm dev
    
    # 构建生产版本
    pnpm build
    ```
    
    ## 环境变量说明
    - `VITE_LLM_API_BASE`: LLM API 基础地址
    - `VITE_LLM_API_KEY`: LLM API 密钥
    - `VITE_BACKEND_API_BASE`: 后端 API 地址
    
    ## 使用指南
    1. 上传手术视频文件
    2. 等待系统解析视频内容
    3. 上传相关医学文献资料
    4. 与 AI 助手进行问答交流
    5. 导出完整的复盘报告
    ```
  - **步骤**：总结项目功能 → 说明技术选型 → 编写安装指南 → 添加使用教程
  - **难度评估**：⭐ 简单，文档编写
  
- [ ] 6.2 代码提交：Git commit 和推送
  - **实现细节**：
    ```bash
    # 检查代码质量
    pnpm lint
    pnpm format
    
    # 提交代码
    git add .
    git commit -m "feat: 完成手术复盘 UI 系统 MVP
    
    - 实现视频上传和播放功能
    - 集成 AI 问答对话系统
    - 支持医学文献上传管理
    - 提供 PDF 报告导出功能
    - 完善错误处理和用户体验"
    
    # 推送到远程仓库
    git push origin main
    ```
  - **步骤**：代码质量检查 → 暂存所有变更 → 编写提交信息 → 推送到远程
  - **难度评估**：⭐ 简单，版本控制操作
  
- [ ] 6.3 部署准备：构建验证和环境配置说明
  - **实现细节**：
    ```bash
    # 生产构建
    pnpm build
    
    # 预览构建结果
    pnpm preview
    
    # Docker 部署（可选）
    FROM node:18-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --only=production
    COPY dist ./dist
    EXPOSE 3000
    CMD ["npx", "serve", "-s", "dist"]
    ```
  - **步骤**：执行生产构建 → 验证构建产物 → 准备部署文档 → 测试部署流程
  - **难度评估**：⭐⭐ 中等，需要了解部署流程

## 项目总体难度评估
- **总体难度**：⭐⭐⭐ 中高难度
- **预估开发时间**：5-7 个工作日
- **关键挑战点**：
  1. 全局状态管理设计 (阶段二)
  2. 视频解析轮询逻辑 (阶段三)
  3. LLM API 集成和错误处理 (阶段三)
  4. PDF 导出功能实现 (阶段三)
  5. 端到端功能测试 (阶段五)
