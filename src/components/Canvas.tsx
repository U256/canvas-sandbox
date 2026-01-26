import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Circle } from "react-konva";
import Konva from "konva";

export const ColoredRect = () => {
  const [color, setColor] = useState("green");

  const handleClick = () => {
    setColor(Konva.Util.getRandomColor());
  };

  return (
    <Rect
      x={20}
      y={20}
      width={50}
      height={50}
      draggable
      fill={color}
      shadowBlur={5}
      onClick={handleClick}
      onDragEnd={(e) => {
        console.log(e);
        setColor(Konva.Util.getRandomColor());
      }}
    />
  );
};

const MyShape = () => {
  const circleRef = useRef(null);

  useEffect(() => {
    // log Konva.Circle instance
    console.log(circleRef.current);
  }, []);

  return <Circle ref={circleRef} radius={50} fill="black" />;
};

export const Canvas = () => {
  return (
    <Stage width={400} height={400}>
      <Layer>
        <Text x={60} text="Try click on rect" />
        <ColoredRect />
        <MyShape />
      </Layer>
    </Stage>
  );
};
