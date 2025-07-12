import React from 'react';
import './WaterClock.css';
import WaterIndicator from './waterIndicator/WaterIndicator';
import { ClockContext } from '@context/ClockContext';
import WaterCard from './waterCard/WaterCard';
import WaterDistorsion from './waterDistorsion/WaterDistorsion';
import WaterBowl from './waterBowl/WaterBowl';
  
export default function WaterClock() {
  const { timestamp, timeModifier, format } = React.useContext(ClockContext);
  const adjustedTimestamp = timestamp + timeModifier * 1000;
  const [secs, setSecs] = React.useState(0);
  const [mins, setMins] = React.useState(0);
  const [hours, setHours] = React.useState(0);
  const updateEachSecs = 2;

  React.useEffect(() => {
    const date = new Date(adjustedTimestamp);
    setSecs(date.getSeconds());
    setMins(date.getMinutes());
    setHours(date.getHours());
  }, [timestamp, timeModifier]);

  return (
    <div className="water-clock">
      <WaterDistorsion 
        style={{
          transform: 'translate(-25%, -25%)',
        }}
        now={secs % updateEachSecs === 0 ? secs : null}
      />
      <WaterIndicator 
        style={{
          transform: 'translate(0, 0) scale(1.5)',
        }}
        properties={{
          lines: 6,
          fontSize: 5,
          startScale: 10,
          stepScale: 10,
          spacesBetweenValues: 2,
          scaleTextHeight: 110,
          updateEachSecs: updateEachSecs,
          isUpdatingHeight: secs % updateEachSecs === 0,
        }}
        now={secs}
      />

      <WaterBowl
        style={{
          transform: 'translate(0, 250%) scale(3, 2)',
        }}
        properties={{
          lines: 6,
          fontSize: 5,
          startScale: 10,
          stepScale: 10,
          spacesBetweenValues: 2,
          scaleTextHeight: 110,
          updateEachSecs: updateEachSecs,
        }}
        now={mins + secs / 60}
      />

      <WaterBowl
        style={{
          transform: 'translate(0, 600%) scale(7, 4)',
        }}
        properties={{
          lines: 6,
          fontSize: 5,
          startScale: 2,
          stepScale: format === '12' ? 2 : 4,
          spacesBetweenValues: 1,
          scaleTextHeight: 110,
          offsetLines: format === '12' ? 0 : 1,
          updateEachSecs: updateEachSecs,
        }}
        now={(format === '12' ? hours % 12 : hours) + mins / 60 + secs / 3600}
      />
    </div>
  );
}