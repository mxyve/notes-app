// 为封装版
import React, { useRef, useEffect, useState } from 'react';
import { Layout, Button, Input, Slider, message } from 'antd';
import Navbar from '@/components/Navbar';
import { createPicture } from '@/api/pictureApi';
import { useStore } from '@/store/userStore';
import GlobalModals from '@/components/GlobalModals';

const CanvasComponent = ({ children }) => {
  const { Content } = Layout;
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
  const [currentWidth, setCurrentWidth] = useState(1); // 初始宽度设为 1
  const [currentColor, setCurrentColor] = useState(paintColors[0]);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawingRectangle, setIsDrawingRectangle] = useState(false);
  const [isDrawingCircle, setIsDrawingCircle] = useState(false);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [isDrawingRoundedRect, setIsDrawingRoundedRect] = useState(false);
  const [isDrawingOval, setIsDrawingOval] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(10); // 圆角半径
  const [isDashed, setIsDashed] = useState(false); // 虚线模式状态
  const [isDrawing, setIsDrawing] = useState(false); // 确保这里定义了 isDrawing 状态
  const backgroundColor = '#FFF';
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentDrawMode, setCurrentDrawMode] = useState(null); // null:自由绘制, 'rectangle', 'circle', 'line', 'roundedRect', 'oval'
  const [title, setTitle] = useState('');
  const { user } = useStore();

  // 设置线条样式
  const setLineStyle = (ctx) => {
    if (isEraser) {
      ctx.strokeStyle = backgroundColor;
    } else {
      ctx.strokeStyle = currentColor;
    }
    ctx.lineWidth = currentWidth;
    ctx.setLineDash(isDashed ? [5, 5] : []);
  };

  // 初始化画笔和事件监听
  const initPainter = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setCanvasContext(ctx);
        ctx.lineWidth = currentWidth;
        ctx.strokeStyle = currentColor;

        ctx.fillStyle = backgroundColor;

        // 鼠标按下事件
        const onMouseDown = (e) => {
          e.preventDefault();
          const { offsetX: x, offsetY: y } = e;
          setIsDrawing(true); // 使用外部的 setIsDrawing
          setStartPos({ x, y });

          if (
            currentDrawMode === null &&
            !isDrawingRectangle &&
            !isDrawingCircle &&
            !isDrawingLine &&
            !isDrawingRoundedRect &&
            !isDrawingOval
          ) {
            ctx.beginPath();
            ctx.moveTo(x, y);
          }
        };

        // 鼠标移动事件
        const onMouseMove = (e) => {
          if (!isDrawing) return; // 使用外部的 isDrawing

          const { offsetX: x, offsetY: y } = e;
          const ctx = canvasContext;
          if (ctx) {
            if (
              isDrawingRectangle ||
              isDrawingCircle ||
              isDrawingLine ||
              isDrawingRoundedRect ||
              isDrawingOval
            ) {
              // 绘制图形时，不进行画布清空操作
              if (undoStack.length > 0) {
                ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
              }
              if (isDrawingRectangle) {
                drawRectangle(startPos.x, startPos.y, x, y);
              } else if (isDrawingCircle) {
                drawCircle(startPos.x, startPos.y, x, y);
              } else if (isDrawingLine) {
                drawLine(startPos.x, startPos.y, x, y);
              } else if (isDrawingRoundedRect) {
                drawRoundedRect(startPos.x, startPos.y, x, y);
              } else if (isDrawingOval) {
                drawOval(startPos.x, startPos.y, x, y);
              }
            } else {
              // 自由绘制时，清空画布并重新绘制
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (undoStack.length > 0) {
                ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
              }
              setLineStyle(ctx);
              ctx.lineTo(x, y);
              ctx.stroke();
            }
          }
        };

        // 鼠标抬起事件
        const onMouseUp = () => {
          if (!isDrawing) return;
          setIsDrawing(false); // 使用外部的 setIsDrawing

          const imageData = canvasContext.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          setUndoStack((prev) => [...prev, imageData]);
          setRedoStack([]);
        };

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);

        return () => {
          canvas.removeEventListener('mousedown', onMouseDown);
          canvas.removeEventListener('mousemove', onMouseMove);
          canvas.removeEventListener('mouseup', onMouseUp);
        };
      }
    }
  };

  // 矩形
  const drawRectangle = (x1, y1, x2, y2) => {
    if (!canvasContext) return;
    const ctx = canvasContext;
    ctx.beginPath();
    setLineStyle(ctx);
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  };

  // 圆形
  const drawCircle = (x1, y1, x2, y2) => {
    if (!canvasContext) return;
    const ctx = canvasContext;
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.beginPath();
    setLineStyle(ctx);
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };
  // 直线
  const drawLine = (x1, y1, x2, y2) => {
    if (!canvasContext) return;
    const ctx = canvasContext;
    ctx.beginPath();
    setLineStyle(ctx);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  // 圆角矩形
  const drawRoundedRect = (x1, y1, x2, y2) => {
    if (!canvasContext) return;
    const ctx = canvasContext;
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.beginPath();
    setLineStyle(ctx);
    // 圆角矩形绘制逻辑
    ctx.moveTo(x1 + cornerRadius, y1);
    ctx.lineTo(x1 + width - cornerRadius, y1);
    ctx.quadraticCurveTo(x1 + width, y1, x1 + width, y1 + cornerRadius);
    ctx.lineTo(x1 + width, y1 + height - cornerRadius);
    ctx.quadraticCurveTo(
      x1 + width,
      y1 + height,
      x1 + width - cornerRadius,
      y1 + height,
    );
    ctx.lineTo(x1 + cornerRadius, y1 + height);
    ctx.quadraticCurveTo(x1, y1 + height, x1, y1 + height - cornerRadius);
    ctx.lineTo(x1, y1 + cornerRadius);
    ctx.quadraticCurveTo(x1, y1, x1 + cornerRadius, y1);
    ctx.closePath();
    ctx.stroke();
  };
  // 椭圆形
  const drawOval = (x1, y1, x2, y2) => {
    if (!canvasContext) return;
    const ctx = canvasContext;
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    ctx.beginPath();
    setLineStyle(ctx);
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };

  // 切换矩形绘制模式
  const toggleRectangleMode = () => {
    if (currentDrawMode === 'rectangle') {
      setCurrentDrawMode(null);
      setIsDrawingRectangle(false);
    } else {
      setCurrentDrawMode('rectangle');
      setIsDrawingRectangle(true);
      // 重置其他图形绘制状态
      setIsDrawingCircle(false);
      setIsDrawingLine(false);
      setIsDrawingRoundedRect(false);
      setIsDrawingOval(false);
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

  // 切换圆形绘制模式
  const toggleCircleMode = () => {
    if (currentDrawMode === 'circle') {
      setCurrentDrawMode(null);
      setIsDrawingCircle(false);
    } else {
      setCurrentDrawMode('circle');
      setIsDrawingCircle(true);
      // 重置其他图形绘制状态
      setIsDrawingRectangle(false);
      setIsDrawingLine(false);
      setIsDrawingRoundedRect(false);
      setIsDrawingOval(false);
      if (!isDrawingCircle && canvasContext && undoStack.length === 0) {
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

  // 切换直线绘制模式
  const toggleLineMode = () => {
    if (currentDrawMode === 'line') {
      setCurrentDrawMode(null);
      setIsDrawingLine(false);
    } else {
      setCurrentDrawMode('line');
      setIsDrawingLine(true);
      // 重置其他图形绘制状态
      setIsDrawingRectangle(false);
      setIsDrawingCircle(false);
      setIsDrawingRoundedRect(false);
      setIsDrawingOval(false);
      if (!isDrawingLine && canvasContext && undoStack.length === 0) {
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

  // 切换圆角矩形绘制模式
  const toggleRoundedRectMode = () => {
    if (currentDrawMode === 'roundedRect') {
      setCurrentDrawMode(null);
      setIsDrawingRoundedRect(false);
    } else {
      setCurrentDrawMode('roundedRect');
      setIsDrawingRoundedRect(true);
      // 重置其他图形绘制状态
      setIsDrawingRectangle(false);
      setIsDrawingCircle(false);
      setIsDrawingLine(false);
      setIsDrawingOval(false);
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

  // 切换椭圆形绘制模式
  const toggleOvalMode = () => {
    if (currentDrawMode === 'oval') {
      setCurrentDrawMode(null);
      setIsDrawingOval(false);
    } else {
      setCurrentDrawMode('oval');
      setIsDrawingOval(true);
      // 重置其他图形绘制状态
      setIsDrawingRectangle(false);
      setIsDrawingCircle(false);
      setIsDrawingLine(false);
      setIsDrawingRoundedRect(false);
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

  // 选择画笔颜色
  const onColorSpanClick = (index) => {
    const newColor = paintColors[index];
    setCurrentColor(newColor);
    if (canvasContext) {
      canvasContext.strokeStyle = newColor;
    }
    setIsEraser(false);
  };

  // 颜色选择器的 onChange 事件处理函数
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    if (canvasContext) {
      canvasContext.strokeStyle = newColor;
    }
    setIsEraser(false);
  };

  // 切换橡皮擦功能
  const toggleEraser = () => {
    setIsEraser(!isEraser);
  };

  // 清空
  const clearAll = () => {
    if (canvasContext) {
      const canvas = canvasRef.current;
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      setUndoStack([]);
      setRedoStack([]);
    }
    setIsDrawingRectangle(false);
    setIsDrawingCircle(false);
    setIsDrawingLine(false);
    setIsDrawingRoundedRect(false);
    setIsDrawingOval(false);
    setIsEraser(false);
    setIsDashed(false);
    setCurrentDrawMode(null);
    setIsDrawing(false);
    setStartPos({ x: 0, y: 0 });
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
  };

  const save = async () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${title || 'painting'}.png`;
      link.click();

      try {
        // 将 dataURL 转换为 Blob 对象
        const response = await fetch(dataURL);
        const blob = await response.blob();
        const file = new File([blob], `${title || 'painting'}.png}`, {
          type: 'image/png',
        });
        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('userId', user.id);

        // 发送请求
        const responseData = await createPicture(formData);

        message.success('创建成功');
      } catch (error) {
        console.error('Failed to updata picture:', error);
        message.error('创建失败');
      }
    }
  };

  useEffect(() => {
    const cleanup = initPainter();
    return cleanup;
  }, [
    isDrawingRectangle,
    isDrawingCircle,
    isDrawingLine,
    isDrawingRoundedRect,
    isDrawingOval,
    currentColor,
    isEraser,
    isDrawing,
    currentWidth,
    isDashed,
    cornerRadius,
    currentDrawMode,
  ]);

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

  return (
    <Layout>
      <Navbar />
      <Content style={{ position: 'relative' }}>
        <div className="flex flex-wrap items-center">
          <div className="flex flex-wrap w-full">
            <span>标题：</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入标题"
              style={{ width: 200, marginRight: 10 }}
            />
            <span>画笔颜色:</span>
            <Input
              className="mr-2 w-25"
              type="color"
              value={currentColor}
              onChange={handleColorChange}
            />
            <div>{paintColorPanel}</div>
            <span>画笔宽度:</span>
            <Slider
              min={1}
              max={6}
              value={currentWidth}
              onChange={(value) => setCurrentWidth(value)}
              style={{ width: 200 }}
            />
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
          </div>
          <div className="flex flex-wrap w-full">
            <Button
              onClick={toggleRectangleMode}
              type={currentDrawMode === 'rectangle' ? 'primary' : 'default'}
            >
              矩形
            </Button>
            <Button
              onClick={toggleCircleMode}
              type={currentDrawMode === 'circle' ? 'primary' : 'default'}
            >
              圆形
            </Button>
            <Button
              onClick={toggleLineMode}
              type={currentDrawMode === 'line' ? 'primary' : 'default'}
            >
              直线
            </Button>
            <Button
              onClick={toggleRoundedRectMode}
              type={currentDrawMode === 'roundedRect' ? 'primary' : 'default'}
            >
              圆角矩形
            </Button>
            <Button
              onClick={toggleOvalMode}
              type={currentDrawMode === 'oval' ? 'primary' : 'default'}
            >
              椭圆形
            </Button>
            <Input
              type="number"
              value={cornerRadius}
              onChange={(e) => setCornerRadius(parseInt(e.target.value) || 0)}
              placeholder="圆角半径"
              style={{ width: 100 }}
            />
            <Button onClick={() => setIsDashed(!isDashed)}>
              {isDashed ? '实线模式' : '虚线模式'}
            </Button>
            <Button onClick={save}>保存</Button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          id="cav"
          width={800}
          height={600}
          style={{ background: '#FFF', position: 'absolute', zIndex: 0 }}
        />
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default CanvasComponent;
