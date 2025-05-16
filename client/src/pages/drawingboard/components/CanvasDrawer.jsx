// components/CanvasDrawer.jsx
import { useRef, useEffect, useState } from 'react';
import { Button, Input, Slider } from 'antd';
import { DownloadOutlined, SaveOutlined } from '@ant-design/icons';

const CanvasDrawer = ({
  width = 800,
  height = 600,
  initialColor = '#000000',
  onSaveToDatabase,
  onDownload,
  initialTitle = '',
}) => {
  const canvasRef = useRef(null);
  const [canvasContext, setCanvasContext] = useState(null);
  const paintColors = [
    '#000000',
    '#0000FF',
    '#CC66FF',
    '#FF0000',
    '#FF9900',
    '#FFFF00',
  ];
  const [currentWidth, setCurrentWidth] = useState(1);
  const [currentColor, setCurrentColor] = useState(initialColor);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const backgroundColor = '#FFF';
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentDrawMode, setCurrentDrawMode] = useState(null);
  const [title, setTitle] = useState(initialTitle);
  const [cornerRadius, setCornerRadius] = useState(10);
  const [isDashed, setIsDashed] = useState(false);

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
          setIsDrawing(true);
          setStartPos({ x, y });

          if (currentDrawMode === null) {
            ctx.beginPath();
            ctx.moveTo(x, y);
          }
        };

        // 鼠标移动事件
        const onMouseMove = (e) => {
          if (!isDrawing) return;

          const { offsetX: x, offsetY: y } = e;
          const ctx = canvasContext;
          if (ctx) {
            if (currentDrawMode) {
              if (undoStack.length > 0) {
                ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
              }
              drawShape(startPos.x, startPos.y, x, y);
            } else {
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
          setIsDrawing(false);

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

  // 绘制形状
  const drawShape = (x1, y1, x2, y2) => {
    if (!canvasContext) return;
    const ctx = canvasContext;
    ctx.beginPath();
    setLineStyle(ctx);

    switch (currentDrawMode) {
      case 'rectangle':
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
        break;
      case 'line':
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        break;
      case 'roundedRect':
        const width = x2 - x1;
        const height = y2 - y1;
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
        break;
      case 'oval':
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const radiusX = Math.abs(x2 - x1) / 2;
        const radiusY = Math.abs(y2 - y1) / 2;
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        break;
      default:
        return;
    }
    ctx.stroke();
  };

  // 切换绘制模式
  const toggleDrawMode = (mode) => {
    if (currentDrawMode === mode) {
      setCurrentDrawMode(null);
    } else {
      setCurrentDrawMode(mode);
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

  // 清空画布
  const clearAll = () => {
    if (canvasContext) {
      const canvas = canvasRef.current;
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      setUndoStack([]);
      setRedoStack([]);
    }
    setCurrentDrawMode(null);
    setIsDrawing(false);
    setIsEraser(false);
    setIsDashed(false);
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

  // 保存到数据库
  const handleSaveToDatabase = () => {
    if (canvasRef.current && onSaveToDatabase) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');
      onSaveToDatabase({ dataURL, title });
    }
  };

  // 下载到本地
  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');

      // 创建下载链接
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${title || 'drawing'}.png`;
      link.click();

      // 如果有下载回调则调用
      if (onDownload) onDownload({ dataURL, title });
    }
  };

  useEffect(() => {
    const cleanup = initPainter();
    return cleanup;
  }, [
    currentDrawMode,
    currentColor,
    isEraser,
    isDrawing,
    currentWidth,
    isDashed,
    cornerRadius,
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
    <div className="canvas-drawer">
      <div className="canvas-controls">
        <div className="control-group">
          <span>标题：</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入标题"
            style={{ width: 200, marginRight: 10 }}
          />
        </div>

        <div className="control-group">
          <span>画笔颜色:</span>
          <Input
            type="color"
            value={currentColor}
            onChange={handleColorChange}
            style={{ width: 50, marginRight: 10 }}
          />
          {paintColorPanel}
        </div>

        <div className="control-group">
          <span>画笔宽度:</span>
          <Slider
            min={1}
            max={20}
            value={currentWidth}
            onChange={(value) => setCurrentWidth(value)}
            style={{ width: 150, marginRight: 10 }}
          />
          <Button onClick={() => setIsEraser(!isEraser)}>
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

        <div className="control-group">
          <Button
            onClick={() => toggleDrawMode('rectangle')}
            type={currentDrawMode === 'rectangle' ? 'primary' : 'default'}
          >
            矩形
          </Button>
          <Button
            onClick={() => toggleDrawMode('circle')}
            type={currentDrawMode === 'circle' ? 'primary' : 'default'}
          >
            圆形
          </Button>
          <Button
            onClick={() => toggleDrawMode('line')}
            type={currentDrawMode === 'line' ? 'primary' : 'default'}
          >
            直线
          </Button>
          <Button
            onClick={() => toggleDrawMode('roundedRect')}
            type={currentDrawMode === 'roundedRect' ? 'primary' : 'default'}
          >
            圆角矩形
          </Button>
          <Button
            onClick={() => toggleDrawMode('oval')}
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
          <Button
            onClick={handleSaveToDatabase}
            type="primary"
            icon={<SaveOutlined />}
          >
            保存到数据库
          </Button>
          <Button onClick={handleDownload} icon={<DownloadOutlined />}>
            下载到本地
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ background: '#FFF', border: '1px solid #ddd' }}
      />
    </div>
  );
};

export default CanvasDrawer;
