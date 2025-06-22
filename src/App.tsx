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

export default App 