import React from 'react';
import './Tooltip.css';

export default function Tooltip({ children, text, position = 'top', timeout = 500, container_props, visibility = false, mode = 'hover' }) {

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

  return (
    <div
      className={`tooltip-container tooltip-${position} ${isVisible ? 'visible' : ''}`}
      ref={tooltipRef}
      data-tooltip={text}
      onMouseEnter={() => mode === 'hover' && setIsVisible(true)}
      onMouseLeave={() => mode === 'hover' && setIsVisible(false)}
      {...container_props}
    >
      {children}
    </div>
  );
}