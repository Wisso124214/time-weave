import React from 'react';
import './CarClock.css';
import Speedometer from '@components/speedometer/Speedometer';
import { ClockContext } from '@context/ClockContext';
import car_sfx from '@src/assets/sounds/car-start-sfx.wav';
import car_alarm_sfx from '@assets/sounds/car-alarm.wav'

export default function CarClock() {
  const { timestamp, timeModifier, format } = React.useContext(ClockContext);
  const adjustedTimestamp = timestamp + timeModifier * 1000;
  
  const [countdown, setCountdown] = React.useState(0);
  const playFirstAudioAsDefault = React.useRef(true);
  const secAudioEach = 5;
  
  React.useEffect(() => {
    const audio_start = new Audio(car_sfx);
    audio_start.volume = 1;
    audio_start.autoplay = true;
  }, []);

  // Update the timestamp every second to force a re-render
  React.useEffect(() => {
    const tick = new Audio(car_alarm_sfx);
    tick.volume = 1;
    const interval = setInterval(() => {
      if (countdown === secAudioEach - 1 && playFirstAudioAsDefault)
        tick.currentTime = 0;
      else
        tick.currentTime = 0.3;

      tick.play().catch(err => console.error('Audio play error:', err));

      if (countdown === secAudioEach - 1 && playFirstAudioAsDefault) {
        const innerInterval = setInterval(() => {
          if (tick.currentTime > 0.3) {
            tick.pause();
            clearInterval(innerInterval);
          }
        }, 10);
      }
      setCountdown(prev => (prev + 1) % secAudioEach);
    }, 1000); // Play sound every second
    return () => clearInterval(interval); // Cleanup on unmount
  }, [adjustedTimestamp]);
  
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
          am_pm: format === '12' ? (new Date(adjustedTimestamp).getMonth() + 1).toString().padStart(2, '0') : (new Date(adjustedTimestamp).getFullYear() % 100).toString().padStart(2, '0'),
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
          am_pm: format === '12' ? (new Date(adjustedTimestamp).getDate()).toString().padStart(2, '0') : (new Date(adjustedTimestamp).getMonth() + 1).toString().padStart(2, '0'),
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
          stepScale: format === '12' ? 1 : 2,
          spacesBetweenValues: format === '12' ? 2 : 4,
          scaleFactor: 1.35,
          size: 40,
          unit: 'km/h',
          am_pm: format === '12' ? new Date(adjustedTimestamp).getHours() >= 12 ? 'pm' : 'am' : (new Date(adjustedTimestamp).getDate()).toString().padStart(2, '0'),
        }}
        now={new Date(adjustedTimestamp).getHours() % 12 + new Date(adjustedTimestamp).getMinutes() / 60 + new Date(adjustedTimestamp).getSeconds() / 3600} 
      />
    </div>
  );
}