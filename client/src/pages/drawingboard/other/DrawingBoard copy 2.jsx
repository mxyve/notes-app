import React, { useRef, useEffect, useState } from 'react';
import { Layout, Button, Input } from 'antd';
import Navbar from '@/components/Navbar';

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [canvasContext, setCanvasContext] = useState(null);
  const paintColors = [
    '#000000',
    '#999999',
    '#CC66FF',
    '#FF0000',
    '#FF9900',
    '#FFFF00',
  ];
  const paintWidths = [1, 2, 3, 4, 5, 6];
  const [currentColor, setCurrentColor] = useState(paintColors[0]); // 初始颜色设为数组中的第一个颜色
  const [isEraser, setIsEraser] = useState(false); // 新增状态，用于表示是否开启橡皮擦
  const backgroundColor = '#FFF'; // 背景颜色
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [savedImageSrc, setSavedImageSrc] = useState('');

  // 初始化画笔和事件监听
  const initPainter = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setCanvasContext(ctx);

        let x = 0;
        let y = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = currentColor;

        // 鼠标按下事件
        const onMouseDown = (e) => {
          e.preventDefault();
          x = e.offsetX;
          y = e.offsetY;
          ctx.beginPath();
          ctx.moveTo(x, y);

          // 鼠标移动事件
          const onMouseMove = (e) => {
            const newX = e.offsetX;
            const newY = e.offsetY;
            ctx.lineTo(newX, newY);
            ctx.stroke();
            x = newX;
            y = newY;
          };

          canvas.addEventListener('mousemove', onMouseMove);
          const onMouseUp = () => {
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseup', onMouseUp);
            // 保存当前画布状态到撤销栈
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            setUndoStack((prev) => [...prev, imageData]);
            // 清空重做栈
            setRedoStack([]);
          };
          canvas.addEventListener('mouseup', onMouseUp);
        };

        canvas.addEventListener('mousedown', onMouseDown);
        return () => {
          canvas.removeEventListener('mousedown', onMouseDown);
        };
      }
    }
  };

  // 选择画笔颜色
  const onColorSpanClick = (index) => {
    const newColor = paintColors[index];
    setCurrentColor(newColor);
    if (canvasContext) {
      canvasContext.strokeStyle = newColor;
    }
    setIsEraser(false); // 选择颜色时关闭橡皮擦
  };

  // 选择画笔宽度
  const onWidthSpanClick = (index) => {
    if (canvasContext) {
      canvasContext.lineWidth = paintWidths[index];
    }
  };

  // 颜色选择器的 onChange 事件处理函数
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    if (canvasContext) {
      canvasContext.strokeStyle = newColor;
    }
    setIsEraser(false); // 选择颜色时关闭橡皮擦
  };

  // 切换橡皮擦功能
  const toggleEraser = () => {
    setIsEraser(!isEraser);
    if (canvasContext) {
      if (isEraser) {
        canvasContext.strokeStyle = currentColor;
      } else {
        canvasContext.strokeStyle = backgroundColor;
      }
    }
  };

  // 清空
  const clearAll = () => {
    if (canvasContext) {
      const canvas = canvasRef.current;
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      // 清空撤销栈和重做栈
      setUndoStack([]);
      setRedoStack([]);
    }
  };

  // 撤销
  const undo = () => {
    setUndoStack((prevUndoStack) => {
      if (prevUndoStack.length > 0) {
        const newUndoStack = [...prevUndoStack];
        const lastState = newUndoStack.pop();
        if (canvasContext) {
          canvasContext.putImageData(lastState, 0, 0);
        }
        setRedoStack((prevRedoStack) => [...prevRedoStack, lastState]);
        console.log('Undo:', prevUndoStack.length);
        console.log('撤销的数据:', lastState); // 打印撤销的数据
        return newUndoStack;
      }
      return prevUndoStack;
    });
  };

  // 重做
  const redo = () => {
    setRedoStack((prevRedoStack) => {
      if (prevRedoStack.length > 0) {
        const newRedoStack = [...prevRedoStack];
        const lastState = newRedoStack.pop();
        if (canvasContext) {
          canvasContext.putImageData(lastState, 0, 0);
        }
        setUndoStack((prevUndoStack) => [...prevUndoStack, lastState]);
        console.log('Redo:', prevRedoStack.length);
        console.log('重做的数据:', lastState); // 打印重做的数据
        return newRedoStack;
      }
      return prevRedoStack;
    });
  };

  // 保存
  const save = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'painting.png';
      link.click();
      console.log('保存的数据:', dataURL); // 打印保存的数据
    }
  };

  useEffect(() => {
    const cleanup = initPainter();
    return cleanup;
  }, []);

  // 颜色面板
  const paintColorPanel = paintColors.map((element, index) => {
    return (
      <span
        key={index}
        style={{
          backgroundColor: element,
          width: '20px',
          height: '20px',
          display: 'inline-block',
          margin: '5px',
          cursor: 'pointer',
        }}
        onClick={() => onColorSpanClick(index)}
      />
    );
  });

  // 画笔宽度面板
  const paintWidthPanel = paintWidths.map((element, index) => {
    return (
      <span
        key={index}
        style={{
          width: '20px',
          height: '20px',
          display: 'inline-block',
          margin: '5px',
          cursor: 'pointer',
        }}
        onClick={() => onWidthSpanClick(index)}
      >
        {element}
      </span>
    );
  });

  return (
    <Layout>
      <Navbar />
      <Layout.Content>
        <div>画笔颜色:</div>
        <Input type="color" value={currentColor} onChange={handleColorChange} />
        <div>{paintColorPanel}</div>
        <div>画笔宽度:</div>
        <div>{paintWidthPanel}</div>
        <Button onClick={toggleEraser}>
          {isEraser ? '关闭橡皮擦' : '开启橡皮擦'}
        </Button>
        <Button onClick={clearAll}>清空</Button>
        <Button onClick={undo} disabled={undoStack.length === 0}>
          撤销
        </Button>
        <Button onClick={redo} disabled={redoStack.length === 0}>
          重做
        </Button>
        <Button onClick={save}>保存</Button>
        <canvas
          ref={canvasRef}
          id="cav"
          width={800}
          height={600}
          style={{ background: '#FFF' }}
        />
      </Layout.Content>
    </Layout>
  );
};

export default CanvasComponent;
