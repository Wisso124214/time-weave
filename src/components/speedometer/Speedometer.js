import React from 'react';
import './Speedometer.css';

export default function Speedometer({ style, properties, now = 0 }) {

  const props = {
    lines: 10,
    startScale: 1,
    stepScale: 1,
    spacesBetweenValues: 4,
    radius: 75,
    radiusWidth: 0.8, // 90% of the radius
    angle: 90,
    offsetAngle: 5,
    offsetAngleScale: -.25,
    offsetRadiusScale: 0.1,
    offsetRadiusText: -0.2,
    fontSize: 12,
    fontFamily: 'TTBB',
    isLinesInward: true,
    offsetLines: 0,
    scaleFactor: 1,
    size: 50,
    unit: 'km/h',
    am_pm: '',
    ...properties
  }

  const canvasRef = React.useRef(null);
  const labelsRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const speedometerRef = React.useRef(null); // Nueva referencia para el div speedometer

  const degreesToRads = (degrees) => degrees * (Math.PI / 180)
  const startAngle = degreesToRads((180 - props.angle) / 2);
  const endAngle = degreesToRads(((180 - props.angle) / 2) + props.angle);

  const moveTheNeedle = (now) => {
    // const total = props.lines * props.stepScale + props.offsetLines + (props.startScale * props.spacesBetweenValues);
    const total = props.lines * props.stepScale + props.offsetLines;
    if (now > total || now < 0)
      now = now % total; // Wrap around if now exceeds total

    now -= props.startScale;
    // Calculate the angle for the needle and rotate the .speedometer-needle div
    const scaleWide = degreesToRads(360 - props.angle - props.offsetAngle * 2);
    const angle = (now / total) * scaleWide - degreesToRads(180 - props.angle / 2) + degreesToRads(props.offsetAngle);
    const needle = speedometerRef.current.querySelector('.speedometer-needle');
    if (needle) {
      needle.style.transform = `translate(-50%, -100%) rotate(${angle}rad)`;
      needle.style.transformOrigin = 'bottom center'; 
    }
  }

  // Nuevo useEffect para ajustar el tamaño del speedometer según props.size
  React.useEffect(() => {
    if (speedometerRef.current) {
      speedometerRef.current.style.setProperty('--size-speedometer', `${props.size}vh`);
    }
  }, [speedometerRef]);

  React.useEffect(() => {
    moveTheNeedle(now);
  }, [now]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const labels = labelsRef.current;
    const container = containerRef.current;
    
    if (canvas && container && labels) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      labels.innerHTML = ''; // Clear previous labels
      
      ctx.lineWidth = 5;
      // Obtener el valor computado de la variable CSS
      const computedStyle = getComputedStyle(container);
      const foregroundColor = computedStyle.getPropertyValue('--speedometer-foreground-color') || '#171717';
      ctx.fillStyle = foregroundColor.trim();
      
      
      // Draw the speedometer background
      ctx.beginPath();
      ctx.lineTo(props.radius / 2, props.radius / 2);
      ctx.moveTo(props.radius, props.radius);
      ctx.arc(props.radius, props.radius, props.radius * props.radiusWidth, startAngle, endAngle, true);
      ctx.fill();
      
      // Draw the speedometer scale bar
      ctx.beginPath();
      ctx.lineWidth = 2;
      const scaleColor = computedStyle.getPropertyValue('--speedometer-scale-color') || '#F99E34';
      ctx.strokeStyle = scaleColor.trim();
      ctx.arc(props.radius, props.radius, props.radius * props.radiusWidth * (1 + props.offsetRadiusScale), startAngle, endAngle, true);
      ctx.stroke();
      
      // Draw the speedometer scale lines
      const lines = props.spacesBetweenValues * props.lines + props.offsetLines;
      const step = (360 - props.angle - (props.offsetAngle * 2)) / lines;
      
      for (let i = 0; i <= lines; i++) {
        const angle = (endAngle + degreesToRads(props.offsetAngle)) + (i * step * Math.PI / 180);
        
        let length = 5; // Length of the scale line
        ctx.lineWidth = .5;
        ctx.strokeStyle = scaleColor.trim();
        
        if (i % props.spacesBetweenValues === 0) {
          length = 10; 
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#ffffff';
          
          // Draw the scale value
          const value = props.startScale + (i / props.spacesBetweenValues) * props.stepScale;
          const textX = (props.radius + (props.radius * props.radiusWidth * (1 + props.offsetRadiusText) * Math.cos(angle))) * props.scaleFactor;
          const textY = (props.radius + (props.radius * props.radiusWidth * (1 + props.offsetRadiusText) * Math.sin(angle))) * props.scaleFactor;

          const label = document.createElement('div');
          label.className = 'speedometer-label';
          label.innerText = value;
          label.style.position = 'absolute';
          label.style.left = `${textX}px`;
          label.style.top = `${textY}px`;
          label.style.fontSize = props.fontSize + 'px';
          label.style.fontFamily = props.fontFamily;
          label.style.color = '#ffffff';
          label.style.textAlign = 'center';
          // label.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
          labels.appendChild(label);
        }
        
        if (i % (props.spacesBetweenValues / 2) === 0 && i % props.spacesBetweenValues !== 0) {
          ctx.lineWidth = 2;
        }
        
        if (props.isLinesInward) 
          length *= -1;   // Invert the length to draw lines inward

        // Calcular desplazamiento perpendicular para centrar la línea según el ancho
        const perpAngle = angle + Math.PI / 2;
        const offsetX = (ctx.lineWidth / 2) * Math.cos(perpAngle) * props.offsetAngleScale;
        const offsetY = (ctx.lineWidth / 2) * Math.sin(perpAngle) * props.offsetAngleScale;

        const x1 = props.radius + (props.radius * props.radiusWidth * (1 + props.offsetRadiusScale) * Math.cos(angle)) + offsetX;
        const y1 = props.radius + (props.radius * props.radiusWidth * (1 + props.offsetRadiusScale) * Math.sin(angle)) + offsetY;
        const x2 = props.radius + ((props.radius * props.radiusWidth + length) * (1 + props.offsetRadiusScale) * Math.cos(angle)) + offsetX;
        const y2 = props.radius + ((props.radius * props.radiusWidth + length) * (1 + props.offsetRadiusScale) * Math.sin(angle)) + offsetY;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  });

  return (
    <div
      className="speedometer"
      style={{ ...style }}
      ref={speedometerRef} // Asigna la referencia aquí
    >
      <div className="speedometer-container" ref={containerRef}>
        <canvas id="speedometer-canvas" ref={canvasRef}></canvas>
        <div className="speedometer-text">{props.unit}</div>
        <div className="speedometer-text-secondary">{props.am_pm}</div>
        <div className="speedometer-needle"></div>
        <div className="speedometer-labels" ref={labelsRef} ></div>
      </div>
    </div>
  );
}