import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useGlobalContext } from '../context/GlobalContext';

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
