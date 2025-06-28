import React from 'react';
import './Digital.css';
import { ClockContext } from '@context/ClockContext';
import ticking from '@assets/sounds/digital-ticking.wav';

export default function Digital() {
  const { timestamp, timeModifier, format } = React.useContext(ClockContext);
  const adjustedTimestamp = timestamp + timeModifier * 1000;

  const audio = new Audio(ticking);
  audio.volume = 1;

  React.useEffect(() => {
    const interval = setInterval(() => {
      audio.currentTime = 0; // Reset audio to the start
      audio.play();
    }, 1000); // Play every second
    return () => clearInterval(interval);
  }, [adjustedTimestamp]);

  const formatTime = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const formatTime12 = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    let hours = date.getHours();
    hours = hours % 12 || 12;
    return `${pad(hours)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return (
    <>
      <h2 className='title'>Digital Clock</h2>
      <div className="digital">
        <div className='digital-time-container'>
          <div className='digital-time-template'>88:88:88</div>
          <div className='digital-time'>
            {format === '12'
              ? formatTime12(new Date(adjustedTimestamp))
              : formatTime(new Date(adjustedTimestamp))}
          </div>
          { format === '12' && <div className='digital-am-pm'>{new Date(adjustedTimestamp).getHours() >= 12 ? 'PM' : 'AM'}</div> }
        </div>
        <div className='digital-date'>
          {(() => {
            const date = new Date(adjustedTimestamp);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleString('default', { month: 'short' });
            return `${month} ${day}`;
          })()}
        </div>
      </div>
    </>
  );
}