import React from 'react';
import './SliderTime.css';

export default function SliderTime({ setTimeModifier }) {

  const [secsModifier, setSecsModifier] = React.useState(0);
  const [minsModifier, setMinsModifier] = React.useState(0);
  const [hoursModifier, setHoursModifier] = React.useState(0);

  React.useEffect(() => {
    const totalModifier = secsModifier + minsModifier * 60 + hoursModifier * 3600;
    setTimeModifier(totalModifier);
  }, [secsModifier, minsModifier, hoursModifier]);

  return (
    <div className="slider-time">
      <label className='slider-label'>Time modifier</label>
      <div className="slider-time-container">
        <label className='slider-label'>H</label>
        <input
          className="slider"
          type="range"
          min="-12"
          max="12"
          id="myRange"
          value={typeof hoursModifier === 'number' ? hoursModifier : 0}
          onChange={e => setHoursModifier(Number(e.target.value))}
          onDoubleClick={() => setHoursModifier(0)}
        />
        <label className='slider-label'>M</label>
        <input
          className="slider"
          type="range"
          min="-60"
          max="60"
          id="myRange"
          value={typeof minsModifier === 'number' ? minsModifier : 0}
          onChange={e => setMinsModifier(Number(e.target.value))}
          onDoubleClick={() => setMinsModifier(0)}
        />
        <label className='slider-label'>S</label>
        <input
          className="slider"
          type="range"
          min="-60"
          max="60"
          id="myRange"
          value={typeof secsModifier === 'number' ? secsModifier : 0}
          onChange={e => setSecsModifier(Number(e.target.value))}
          onDoubleClick={() => setSecsModifier(0)}
        />
      </div>
    </div>
  );
}