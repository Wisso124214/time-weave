import React from 'react';
import './WaterBowl.css';

export default function WaterBowl({ properties, now, style, format }) {

  const { lines = 0, 
          offsetLines = 0, 
          fontSize = 16, 
          startScale = 0, 
          stepScale = 1,
          spacesBetweenValues = 0,
          scaleTextHeight = 100,
          minValue = 0,
          isUpdatingHeight = true,
        } = properties;

  const scaleRef = React.useRef(null);
  const scaleTextRef = React.useRef(null);
  const liquidRef = React.useRef(null);
  
  React.useEffect(() => {
    const scale = scaleRef.current;
    const scaleText = scaleTextRef.current;
    const liquid = liquidRef.current;

    if (liquid && isUpdatingHeight) {
      liquid.style.height = `${(now) * 100 / ((lines - 1) * stepScale + startScale)}%`;
    }

    if (lines && scale && scaleText) {
      scale.innerHTML = '';
      scaleText.innerHTML = '';
      scaleText.style.height = `${scaleTextHeight}%`;
      for (let i = 0; i < (lines + offsetLines); i++) {
        if (scale.children.length <= 0) {
          const shortMark = document.createElement('div');
          shortMark.className = 'short-mark';
          scale.appendChild(shortMark);
        }

        for (let j = 0; j < spacesBetweenValues; j++) {
          const shortMark = document.createElement('div');
          shortMark.className = 'short-mark';
          scale.appendChild(shortMark);
        }

        const line = document.createElement('div');
        line.className = 'mark';
        scale.appendChild(line);

        if (scaleText.children.length <= 0) {
          const value = document.createElement('span');
          value.className = 'mark-text';
          value.style.fontSize = `${fontSize}px`;
          value.textContent = minValue;
          scaleText.appendChild(value);
        }
        const value = document.createElement('span');
        value.className = 'mark-text';
        value.style.fontSize = `${fontSize}px`;
        value.textContent = `${i * stepScale + startScale}`;
        scaleText.appendChild(value);
      }
    }
  }, [properties, now, format])

  return (
    <div className="water-bowl-container" style={{ ...style }}>
      <div className="water-bowl">
        <div className="bowl"></div>
        <div className="liquid" ref={liquidRef}></div>
        <div className="scale" ref={scaleRef}></div>
      </div>
      <div className="scale-text" ref={scaleTextRef}></div>
    </div>
  );
}
