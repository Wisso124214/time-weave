
import React, { useEffect, useState, useRef, useContext } from 'react';
import tick from '@assets/sounds/water-drop-sfx.wav';
import './WaterDrop.css';
import { ClockContext } from '@context/ClockContext';

export default function WaterDrop({ properties, now = 0 }) {
  const { lines = 0,
          startScale = 0,
          stepScale = 1,
          updateEachSecs = 1,
        } = properties;
  const [key, setKey] = useState(0);
  const waterDrop = useRef(null);
  const { isSliderActive } = useContext(ClockContext);

  const audio = new Audio(tick);
  audio.volume = 1;

  const baseTop = -20;
  const minTop = -5;

  useEffect(() => {
    if (waterDrop.current && now) {
      const top = baseTop + now * (minTop) / ((lines - 1) * stepScale + startScale);
      waterDrop.current.style.top = `${top}vh`;

      // Animaciones dinámicas
      const drops = waterDrop.current.querySelectorAll('.drop');
      if (drops[0]) drops[0].style.animation = `drip ${0.3 * updateEachSecs}s linear`;
      if (drops[1]) drops[1].style.animation = `bounce ${0.275 * updateEachSecs}s ${0.4 * updateEachSecs}s linear`;
      if (drops[2]) drops[2].style.animation = `splash-right ${0.275 * updateEachSecs}s ${0.6 * updateEachSecs}s linear`;
      if (drops[3]) drops[3].style.animation = `splash-left ${0.275 * updateEachSecs}s ${0.6 * updateEachSecs}s linear`;
    }

    if (!isSliderActive && now % updateEachSecs === 0) {
      audio.currentTime = 0; // Reset audio to start
      audio.play().catch(err => console.error('Audio play error:', err));
      setTimeout(() => {
        setKey(prev => prev + 1);
      }, 900);
    }
  }, [now, updateEachSecs]);

  return (
    <div className="water-drop" key={key} ref={waterDrop} updateEachSecs={Number(updateEachSecs)}>
      <div className="drop"></div>
      <div className="drop"></div>
      <div className="puddle"></div>
      <div className="drop"></div>
      <div className="drop"></div>
    </div>
  );
}
