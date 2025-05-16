// Export.jsx
import React, { useState } from 'react';
import { Button, Space } from 'antd';
import { FilePdfOutlined, FileMarkdownOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Export = ({ note, isExportingMd, setIsExportingMd }) => {
  const exportToPDF = async () => {
    try {
      const element = document.getElementById('markdown-content');

      // 临时调整元素样式以便完整捕获
      const originalStyles = {
        overflow: element.style.overflow,
        height: element.style.height,
      };
      element.style.overflow = 'visible';
      element.style.height = 'auto';

      // 计算元素的总高度
      const elementHeight = element.scrollHeight;
      const elementWidth = element.scrollWidth;
      const canvasHeight = elementHeight * 2; // 2倍缩放
      const canvasWidth = elementWidth * 2;

      // 创建一个大canvas来容纳所有内容
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext('2d');

      // 分段捕获内容
      const captureHeight = window.innerHeight * 2;
      let yPosition = 0;

      while (yPosition < elementHeight) {
        const canvasSlice = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          windowHeight: captureHeight,
          y: yPosition,
          scrollY: -yPosition,
        });

        context.drawImage(canvasSlice, 0, yPosition * 2);
        yPosition += captureHeight / 2;
      }

      // 恢复原始样式
      element.style.overflow = originalStyles.overflow;
      element.style.height = originalStyles.height;

      // 创建PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // 分页添加内容
      let heightLeft = pdfHeight;
      let position = 0;
      const imgWidth = pdfWidth;
      const imgHeight = pdfHeight;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`${note.title}.pdf`);
    } catch (error) {
      console.error('导出 PDF 失败:', error);
      alert('导出 PDF 失败');
    }
  };

  const exportToMarkdown = () => {
    if (!note) return;

    setIsExportingMd(true);
    try {
      // 创建Markdown文件内容
      const markdownContent =
        `# ${note.title}\n\n` +
        `**创建时间**: ${new Date(note.created_at).toLocaleString()}\n\n` +
        `**标签**: ${note.tags.map((tag) => `\`${tag}\``).join(', ')}\n\n` +
        `**字数**: ${note.content.length}\n\n` +
        note.content;

      // 创建Blob对象
      const blob = new Blob([markdownContent], { type: 'text/markdown' });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${note.title.replace(/[^\w\s]/gi, '')}.md` || 'note.md'; // 移除特殊字符

      // 触发下载
      document.body.appendChild(a);
      a.click();

      // 清理
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出Markdown失败:', error);
      alert('导出Markdown失败');
    } finally {
      setIsExportingMd(false);
    }
  };

  return (
    <Space>
      <Button type="primary" onClick={exportToPDF} className="ml-4">
        导出为PDF
      </Button>
      <Button
        onClick={exportToMarkdown}
        icon={<FileMarkdownOutlined />}
        loading={isExportingMd}
      >
        导出Markdown
      </Button>
    </Space>
  );
};

export default Export;
