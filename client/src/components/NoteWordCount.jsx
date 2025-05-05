import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

/**
 * 计算Markdown内容的有效字数
 * @param {string} markdown - Markdown文本内容
 * @returns {number} 字数统计结果
 */
const countWords = (markdown) => {
  if (!markdown) return 0;

  // 去除Markdown标记和HTML标签
  const plainText = markdown
    .replace(/[#*`\-\[\]!()|]/g, '') // 去除Markdown标记
    .replace(/<[^>]*>/g, '') // 去除HTML标签
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim();

  // 中文按字统计，英文按词统计
  const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g) || [];
  const englishWords = plainText
    .replace(/[\u4e00-\u9fa5]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return chineseChars.length + englishWords.length;
};

const NoteWordCount = ({
  content,
  className,
  showIcon = true,
  onCountChange,
}) => {
  const wordCount = countWords(content);

  // 如果有回调函数，调用它
  React.useEffect(() => {
    if (onCountChange) {
      onCountChange(wordCount);
    }
  }, [wordCount, onCountChange]);

  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && (
        <svg
          className="w-4 h-4 mr-1 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
      <Text type="secondary" className="text-sm">
        字数: {wordCount}
      </Text>
    </div>
  );
};

export default NoteWordCount;
