import React from 'react';
import './Clocks.css';
import Dropdown from '@components/dropdown/Dropdown';
import Navigation from '@components/navigation/Navigation';
import ClockContextProvider, { ClockContext } from '@context/ClockContext';

export default function Clocks() {
  const [clockSelected, setClockSelected] = React.useState('WallClock');
  const allClocks = [
    'Digital',
    'CarClock',
    'WallClock',
    'Blank',
  ];

  return (
    <div className="clocks">
      <ClockContextProvider>
        <ClockContext.Consumer>
          {({ timeModifier, setTimeModifier, format, setFormat }) => (
            <>
              <Dropdown
                allOptions={['12', '24']}
                optionSelected={format || 'default'}
                setOptionSelected={setFormat}
                defaultOption='12'
                styles={{
                  dropdown: {
                    position: 'absolute',
                    top: '30px',
                    right: '180px',
                  },
                  select: {
                    border: '3px solid black',
                    borderRadius: '.7rem',
                    paddingLeft: '.5rem',
                    paddingRight: '.8rem',
                  },
                  option: {
                    borderRadius: '.7rem',
                    hover_color: 'black', // Does not work
                  }
                }}
              />
              <Dropdown
                allOptions={allClocks}
                optionSelected={clockSelected || 'default'}
                setOptionSelected={setClockSelected}
                defaultOption='Clock 2'
                styles={{
                  dropdown: {
                    position: 'absolute',
                    top: '30px',
                    right: '50px',
                  },
                  select: {
                    border: '3px solid black',
                    borderRadius: '.7rem',
                    paddingLeft: '.5rem',
                    paddingRight: '.8rem',
                  },
                  option: {
                    borderRadius: '.7rem',
                    hover_color: 'black', // Does not work
                  }
                }}
              />
              <Navigation 
                pages={allClocks} 
                currentPage={clockSelected === 'default' ? 'Digital' : clockSelected} 
                rootPath='components/clocks'  // Adjust the path to Navigation.js
              />
              <div className="slidecontainer">
                <label className='slider-label'>Time modifier</label>
                <input
                  className="slider"
                  type="range"
                  min="-43200"
                  max="43200"
                  id="myRange"
                  value={typeof timeModifier === 'number' ? timeModifier : 0}
                  onChange={e => setTimeModifier(Number(e.target.value))}
                  onDoubleClick={() => setTimeModifier(0)}
                />
              </div>
            </>
          )}
        </ClockContext.Consumer>
      </ClockContextProvider>
    </div>
  );
}