import React from 'react';
import './CarClock24.css';
import Speedometer from '@components/speedometer/Speedometer';

export default function CarClock() {

  const [timestamp, setTimestamp] = React.useState(Date.now());
  
  // Update the timestamp every second to force a re-render
  React.useEffect(() => {
    const audio = new Audio(require('@src/assets/sounds/car-start-sfx.wav'));
    audio.volume = 1;
    audio.autoplay = true;

    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="car-clock">
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
        now={new Date(timestamp).getSeconds()}
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
        now={new Date(timestamp).getMinutes() + new Date(timestamp).getSeconds() / 60}
      />
      <Speedometer
        style={{
          transform: 'translate(-160%, -80%)',
        }}
        properties={{
          lines: 12,
          fontSize: 15,
          startScale: 0,
          stepScale: 2,
          spacesBetweenValues: 4,
          scaleFactor: 1.35,
          size: 40,
          unit: 'km/h',
        }}
        now={new Date(timestamp).getHours() % 12 + new Date(timestamp).getMinutes() / 60 + new Date(timestamp).getSeconds() / 3600} 
      />
    </div>
  );
}