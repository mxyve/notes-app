// ⭐ 矩形的好了

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
  const [currentColor, setCurrentColor] = useState(paintColors[0]);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawingRectangle, setIsDrawingRectangle] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false); // 确保这里定义了 isDrawing 状态
  const backgroundColor = '#FFF';
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // 初始化画笔和事件监听
  const initPainter = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setCanvasContext(ctx);
        ctx.lineWidth = paintWidths[0];
        ctx.strokeStyle = currentColor;

        // 鼠标按下事件
        const onMouseDown = (e) => {
          e.preventDefault();
          const { offsetX: x, offsetY: y } = e;
          setIsDrawing(true); // 使用外部的 setIsDrawing
          setStartPos({ x, y });

          if (!isDrawingRectangle && !isDrawingCircle) {
            ctx.beginPath();
            ctx.moveTo(x, y);
          }
        };

        // 鼠标移动事件
        const onMouseMove = (e) => {
          if (!isDrawing) return; // 使用外部的 isDrawing

          const { offsetX: x, offsetY: y } = e;

          if (isDrawingRectangle) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (undoStack.length > 0) {
              ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
            }
            drawRectangle(startPos.x, startPos.y, x, y, true);
          } else {
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        };

        // 鼠标抬起事件
        const onMouseUp = () => {
          if (!isDrawing) return;
          setIsDrawing(false); // 使用外部的 setIsDrawing

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setUndoStack((prev) => [...prev, imageData]);
          setRedoStack([]);
        };

        // 鼠标离开画布事件
        const onMouseLeave = () => {
          setIsDrawing(false); // 使用外部的 setIsDrawing
        };

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseLeave);

        return () => {
          canvas.removeEventListener('mousedown', onMouseDown);
          canvas.removeEventListener('mousemove', onMouseMove);
          canvas.removeEventListener('mouseup', onMouseUp);
          canvas.removeEventListener('mouseleave', onMouseLeave);
        };
      }
    }
  };

  // 绘制矩形（isTemp参数表示是否是临时预览）
  const drawRectangle = (x1, y1, x2, y2, isTemp = false) => {
    if (!canvasContext) return;

    const ctx = canvasContext;
    ctx.beginPath();

    // 计算矩形的位置和尺寸
    const width = x2 - x1;
    const height = y2 - y1;

    // 设置样式
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = ctx.lineWidth;
    ctx.setLineDash([]); // 确保使用实线

    // // 临时预览使用虚线
    // ctx.setLineDash([5, 5]);

    ctx.rect(x1, y1, width, height);
    ctx.stroke();
  };

  // 选择画笔颜色
  const onColorSpanClick = (index) => {
    const newColor = paintColors[index];
    setCurrentColor(newColor);
    if (canvasContext) {
      canvasContext.strokeStyle = newColor;
    }
    setIsEraser(false);
    setIsDrawingRectangle(false); // 选择颜色时关闭矩形绘制模式
  };

  // 选择画笔宽度
  const onWidthSpanClick = (index) => {
    if (canvasContext) {
      canvasContext.lineWidth = paintWidths[index];
    }
    setIsDrawingRectangle(false); // 选择宽度时关闭矩形绘制模式
  };

  // 颜色选择器的 onChange 事件处理函数
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    if (canvasContext) {
      canvasContext.strokeStyle = newColor;
    }
    setIsEraser(false);
    setIsDrawingRectangle(false); // 选择颜色时关闭矩形绘制模式
  };

  // 切换橡皮擦功能
  const toggleEraser = () => {
    setIsEraser(!isEraser);
    setIsDrawingRectangle(false); // 切换橡皮擦时关闭矩形绘制模式
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
      setUndoStack([]);
      setRedoStack([]);
    }
    setIsDrawingRectangle(false); // 清空时关闭矩形绘制模式
  };

  // 撤销
  const undo = () => {
    setUndoStack((prevUndoStack) => {
      if (prevUndoStack.length > 1) {
        const newUndoStack = [...prevUndoStack];
        const lastState = newUndoStack.pop();
        const previousState = newUndoStack[newUndoStack.length - 1];
        if (canvasContext) {
          canvasContext.putImageData(previousState, 0, 0);
        }
        setRedoStack((prevRedoStack) => [...prevRedoStack, lastState]);
        return newUndoStack;
      } else if (prevUndoStack.length === 1) {
        if (canvasContext) {
          const canvas = canvasRef.current;
          canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        }
        setRedoStack((prevRedoStack) => [...prevRedoStack, ...prevUndoStack]);
        return [];
      }
      return prevUndoStack;
    });
    setIsDrawingRectangle(false); // 撤销时关闭矩形绘制模式
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
        return newRedoStack;
      }
      return prevRedoStack;
    });
    setIsDrawingRectangle(false); // 重做时关闭矩形绘制模式
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
    }
    setIsDrawingRectangle(false); // 保存时关闭矩形绘制模式
  };

  // 切换矩形绘制模式
  const toggleRectangleMode = () => {
    setIsDrawingRectangle(!isDrawingRectangle);
    if (!isDrawingRectangle) {
      // 如果正在开启矩形模式，保存当前状态
      if (canvasContext && undoStack.length === 0) {
        const canvas = canvasRef.current;
        const imageData = canvasContext.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        setUndoStack([imageData]);
      }
    }
  };

  // 绘制圆形
  const drawCircle = () => {
    setIsDrawingRectangle(false); // 绘制圆形时关闭矩形绘制模式
    if (canvasContext) {
      const ctx = canvasContext;
      const circle = new Path2D();
      circle.moveTo(125, 35);
      circle.arc(100, 35, 25, 0, 2 * Math.PI);
      ctx.fillStyle = currentColor;
      ctx.fill(circle);
      const imageData = ctx.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      setUndoStack((prev) => [...prev, imageData]);
      setRedoStack([]);
    }
  };

  useEffect(() => {
    const cleanup = initPainter();
    return cleanup;
  }, [isDrawingRectangle, currentColor, isEraser, isDrawing]); // 添加 isDrawing 到依赖数组

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
        <Button
          onClick={toggleRectangleMode}
          type={isDrawingRectangle ? 'primary' : 'default'}
        >
          {isDrawingRectangle ? '正在绘制矩形...' : '绘制矩形'}
        </Button>
        <Button onClick={drawCircle}>绘制圆形</Button>
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
