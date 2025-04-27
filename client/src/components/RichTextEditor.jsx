import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange }) => {
  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={{
          toolbar: [
            // 加粗、斜体、下划线、删除线
            ['bold', 'italic', 'underline', 'strike'],
            // 引用、代码块
            ['blockquote', 'code-block'],
            // 有序、无序列表
            [{ list: 'ordered' }, { list: 'bullet' }],
            // 缩进
            [{ indent: '-1' }, { indent: '+1' }],
            // 字体大小
            [{ size: ['small', false, 'large', 'huge'] }],
            // 标题
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            // 字体颜色、背景颜色
            [{ color: [] }, { background: [] }],
            // 对齐方式
            [{ align: [] }],
            // 清除文本格式
            ['clean'],
            // 链接、图片、视频
            ['link', 'image', 'video'],
          ],
        }}
        // style={{ hight: '500px' }}
      />
    </div>
  );
};

export default RichTextEditor;
