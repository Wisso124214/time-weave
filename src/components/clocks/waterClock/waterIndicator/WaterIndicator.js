import React from 'react';
import './WaterIndicator.css';
import WaterDrop from '../waterDrop/WaterDrop';
import WaterBowl from '../waterBowl/WaterBowl';

export default function WaterIndicator({ style, properties, now }) {
  return (
    <div className="water-indicator-center" style={{ ...style }}>
      <WaterDrop 
        properties={properties}
        now={now}
      />
      <WaterBowl 
        properties={properties}
        now={now}
      />
    </div>
  );
}