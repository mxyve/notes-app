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
  const [savedImageSrc, setSavedImageSrc] = useState(''); // 新增状态，用于存储保存的图片的 src

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
          canvas.addEventListener('mouseup', () => {
            canvas.removeEventListener('mousemove', onMouseMove);
          });
        };

        canvas.addEventListener('mousedown', onMouseDown);
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
    }
  };

  const undo =() =>{
    this.clearCanvas()
    const img = this.undoStack.pop()
    if (!img) {
      return
    }
    this.ctx.drawImage(img, 0, 0)
    this.redoStack.push(img)
  }
​
  const redo=()=> {
    this.clearCanvas()
    const img = this.redoStack.pop()
    if (!img) {
      return
    }
    this.ctx.drawImage(img, 0, 0)
    this.undoStack.push(img)
  }

  // 保存
  const save = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');
      setSavedImageSrc(dataURL); // 将图片的 src 存储到状态中
    }
  };

  useEffect(() => {
    initPainter();
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
        <Button onClick={undo}>撤退</Button>
        <Button onClick={redo}>前进</Button>
        <Button onClick={save}>保存</Button>
        <canvas
          ref={canvasRef}
          id="cav"
          width={800}
          height={600}
          style={{ background: '#FFF' }}
        />
        {savedImageSrc && (
          <img
            src={savedImageSrc}
            alt="Saved Canvas"
            style={{ marginTop: '20px' }}
          />
        )}
      </Layout.Content>
    </Layout>
  );
};

export default CanvasComponent;


// Path2D.lineTo()
// Path2D.arc()
// Path2D.ellipse()
// Path2D.rect()  把画的每一笔存到数组中，并在控制台打印下来