// Draft
import React, { useState } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Button } from 'antd'; // 假设用 antd 来创建按钮，也可用其他方式

// const RichTextEditor = ({ initialContent }) => {
//   const [editorState, setEditorState] = useState(() => {
//     if (initialContent) {
//       // // 这里可以根据 initialContent 初始化 EditorState
//       // return EditorState.createEmpty();
//       try {
//         // 假设 initialContent 是 JSON 字符串形式的 Draft.js 内容
//         const rawContent = JSON.parse(initialContent);
//         const contentState = convertFromRaw(rawContent);
//         return EditorState.createWithContent(contentState);
//       } catch (error) {
//         console.error('Initial content parsing error:', error);
//         return EditorState.createEmpty();
//       }
//     }
//     return EditorState.createEmpty();
//   });
//   const handleEditorChange = (newEditorState) => {
//     setEditorState(newEditorState);
//   };
//   return <Editor editorState={editorState} onChange={handleEditorChange} />;
// };

const RichTextEditor = ({ initialContent }) => {
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      // 这里可以根据 initialContent 初始化 EditorState
      return EditorState.createEmpty();
    }
    return EditorState.createEmpty();
  });
  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
  };
  const handleBold = () => {
    const newEditorState = RichUtils.toggleInlineStyle(editorState, 'BOLD');
    setEditorState(newEditorState);
  };
  const handleItalic = () => {
    const newEditorState = RichUtils.toggleInlineStyle(editorState, 'ITALIC');
    setEditorState(newEditorState);
  };
  return (
    <div>
      <div>
        <Button onClick={handleBold}>加粗</Button>
        <Button onClick={handleItalic}>斜体</Button>
        {/* 可继续添加更多样式按钮，如下划线、字号选择等 */}
      </div>
      <div
        style={{ border: '1px solid black', minHeight: '6em', cursor: 'text' }}
      >
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          placeholder="Write something!"
        />
      </div>
    </div>
  );
};
export default RichTextEditor;
