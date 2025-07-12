import React, { useEffect, useState, useRef } from 'react';
import './WaterDrop.css';

export default function WaterDrop({ properties, now = 0 }) {
  const { lines = 0,
          startScale = 0,
          stepScale = 1,
          updateEachSecs = 1,
        } = properties;
  const [key, setKey] = useState(0);
  const waterDrop = useRef(null);

  const baseTop = -20;
  const minTop = -5;

  useEffect(() => {
    if (waterDrop.current && now) {
      const top = baseTop + now * (minTop) / ((lines - 1) * stepScale + startScale);
      waterDrop.current.style.top = `${top}vh`;
    }

    if (now % updateEachSecs === 0) {
      setTimeout(() => {
        setKey(prev => prev + 1);
      }, 1000);
    }
  }, [now]);

  return (
    <div className="water-drop" key={key} ref={waterDrop}>
      <div className="drop"></div>
      <div className="drop"></div>
      <div className="puddle"></div>
      <div className="drop"></div>
      <div className="drop"></div>
    </div>
  );
}
