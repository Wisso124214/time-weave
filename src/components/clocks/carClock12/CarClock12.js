import React from 'react';
import './CarClock12.css';
import Speedometer from '@components/speedometer/Speedometer';
import car_sfx from '@src/assets/sounds/car-start-sfx.wav';
import { ClockContext } from '@context/ClockContext';

export default function CarClock() {
  const { timestamp, timeModifier } = React.useContext(ClockContext);
  const adjustedTimestamp = timestamp + timeModifier * 1000;
  
  // Update the timestamp every second to force a re-render
  React.useEffect(() => {
    const audio = new Audio(car_sfx);
    audio.volume = 1;
    audio.autoplay = true;
  }, []);
  
  return (
    adjustedTimestamp && <div className="car-clock">
      <Speedometer
        style={{
          transform: 'translate(60%, -80%)',
        }}
        properties={{
          lines: 12,
          offsetLines: -1,
          fontSize: 15,
          startScale: 0,
          stepScale: 5,
          spacesBetweenValues: 5,
          scaleFactor: 1.35,
          size: 40,
          unit: 'm/s',
        }}
        now={new Date(adjustedTimestamp).getSeconds()}
      />
      <Speedometer
        style={{
          transform: 'translate(-50%, -30%)',
        }}
        properties={{
          lines: 12,
          offsetLines: -1,
          fontSize: 20,
          startScale: 0,
          stepScale: 5,
          spacesBetweenValues: 5,
          scaleFactor: 1.65,
          size: 50,
          unit: 'rpm',
        }}
        now={new Date(adjustedTimestamp).getMinutes() + new Date(adjustedTimestamp).getSeconds() / 60}
      />
      <Speedometer
        style={{
          transform: 'translate(-160%, -80%)',
        }}
        properties={{
          lines: 12,
          fontSize: 15,
          startScale: 0,
          stepScale: 1,
          spacesBetweenValues: 2,
          scaleFactor: 1.35,
          size: 40,
          am_pm: new Date(adjustedTimestamp).getHours() >= 12 ? 'pm' : 'am',
          unit: 'km/h',
        }}
        now={new Date(adjustedTimestamp).getHours() % 12 + new Date(adjustedTimestamp).getMinutes() / 60 + new Date(adjustedTimestamp).getSeconds() / 3600} 
      />
    </div>
  );
}