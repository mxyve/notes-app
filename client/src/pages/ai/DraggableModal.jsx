// src/components/DraggableModal/index.jsx
import { Modal, Button, Spin } from 'antd';
import { useState, useRef } from 'react';
import Draggable from 'react-draggable';

const DraggableModal = ({
  title = '对话框',
  open,
  onCancel,
  onSubmit,
  loading,
  children,
  footer,
  width = 800,
  submitText = '提交',
  cancelText = '取消',
  showSubmit = true,
}) => {
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  const [disabled, setDisabled] = useState(true);

  const onStart = (event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) return;

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const defaultFooter = [
    <Button key="cancel" onClick={onCancel}>
      {cancelText}
    </Button>,
    showSubmit && (
      <Button key="submit" type="primary" onClick={onSubmit} loading={loading}>
        {submitText}
      </Button>
    ),
  ].filter(Boolean);

  return (
    <Modal
      title={
        <div
          style={{ width: '100%', cursor: 'move' }}
          onMouseOver={() => disabled && setDisabled(false)}
          onMouseOut={() => setDisabled(true)}
          onMouseDown={(e) => e.preventDefault()}
        >
          {title}
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={footer || defaultFooter}
      width={width}
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          onStart={onStart}
          nodeRef={draggleRef}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      {loading ? (
        <Spin style={{ display: 'block', margin: '20px auto' }} />
      ) : (
        children
      )}
    </Modal>
  );
};

export default DraggableModal;
