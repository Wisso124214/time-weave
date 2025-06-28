import React from 'react';
import './WallClock.css';

export default function WallClock() {
  return (
    <div className="wall-clock">
      <div className="wall-clock-face">
        <div className="second-hand"></div>
      </div>
    </div>
  );
}