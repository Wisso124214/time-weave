import React from 'react';
import './Tooltip.css';

export default function Tooltip({ children, text, position = 'top', timeout = 500, container_props, visibility = false, mode = 'hover', className, contentStyle = {} }) {

  const [tooltipText, setTooltipText] = React.useState(text || '');
  const tooltipRef = React.useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!tooltipRef || !tooltipRef.current) return;
    const tooltipElement = tooltipRef.current;

    if (tooltipElement && tooltipElement.classList) {
      tooltipElement.classList.remove('top', 'bottom', 'left', 'right');
      if (isVisible) {
        tooltipElement.classList.add('visible');
        tooltipElement.classList.add(position);
      }
    }
  }, [isVisible, position]);

  React.useEffect(() => {
    if (mode === 'visibility') {
      if (visibility) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  }, [visibility]);

  React.useEffect(() => {
    if (text !== '') {
      setTooltipText(text);
    }
  }, [text]);

  return (
    <div
      className={`tooltip-container`}
      ref={tooltipRef}
      onMouseEnter={() => mode === 'hover' && setIsVisible(true)}
      onMouseLeave={() => mode === 'hover' && setIsVisible(false)}
      {...container_props}
    >
      {children}
      {
        <div 
          className={`tooltip-content tooltip-${position} ${isVisible ? 'visible' : ''} ${className}`}
          data-tooltip={tooltipText}
          style={{ ...contentStyle }}
        >
          {tooltipText}
        </div>
      }
    </div>
  );
}