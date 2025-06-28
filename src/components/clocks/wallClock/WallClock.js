import React from 'react';
import './WallClock.css';
import { ClockContext } from '@context/ClockContext';
import tick from '@assets/sounds/clock-ticking.wav'

export default function WallClock() {

  const { timestamp, timeModifier } = React.useContext(ClockContext);
  const adjustedTimestamp = timestamp + timeModifier * 1000;

  React.useEffect(() => {
    const audio = new Audio(tick);
    audio.volume = 1;
    const interval = setInterval(() => {
      audio.currentTime = 0; // Reset audio to start
      audio.play().catch(err => console.error('Audio play error:', err));
    }, 1000); // Play sound every second
    return () => clearInterval(interval); // Cleanup on unmount
  }, [adjustedTimestamp]);

  const hours = new Date(adjustedTimestamp).getHours();
  const minutes = new Date(adjustedTimestamp).getMinutes();
  const seconds = new Date(adjustedTimestamp).getSeconds();

  const offsetDegHour = 27;
  const offsetDegMinute = -43;

  const hourDeg = hours * 30 + minutes * 0.5 + offsetDegHour; // 360 degrees / 12 hours + (minutes / 60)
  const minuteDeg = minutes * 6 + seconds * 0.1 + offsetDegMinute; // 360 degrees / 60 minutes + (seconds / 60)
  const secondDeg = seconds * 6; // 360 degrees / 60 seconds

  React.useEffect(() => {
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const secondHand = document.querySelector('.second-hand');

    if (minuteHand && hourHand && secondHand) {
      hourHand.style.transform = `translate(calc(-50% - 19px), calc(-50% + 352px)) rotate(${hourDeg}deg)`;
      hourHand.style.transition = `transform ${hourDeg !== offsetDegHour ? 1 : 0}s ease-in-out`;
      minuteHand.style.transform = `translate(calc(-50% + 45px), calc(-50% + 210px)) rotate(${minuteDeg}deg)`;
      minuteHand.style.transition = `transform ${minuteDeg !== offsetDegMinute ? 1 : 0}s ease-in-out`;
      secondHand.style.transform = `translate(0, 100px) rotate(${secondDeg}deg)`;
      // secondHand.style.transition = `transform ${secondDeg !== 0 ? 1 : 0}s ease-in-out`;
    }
  }, [hourDeg, minuteDeg, secondDeg]);

  return (
    <div className="wall-clock">
      <div className="wall-clock-image"></div>
      <div className="wall-clock-hand hour-hand"></div>
      <div className="wall-clock-hand minute-hand"></div>
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" />
      </svg>
      <div className="wall-clock-hand second-hand">
      </div>
    </div>
  );
}