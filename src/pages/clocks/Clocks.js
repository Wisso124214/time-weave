import React from 'react';
import './Clocks.css';
import Dropdown from '@components/dropdown/Dropdown';
import Navigation from '@components/navigation/Navigation';
import ClockContextProvider, { ClockContext } from '@context/ClockContext';

export default function Clocks() {
  const [clockSelected, setClockSelected] = React.useState('Blank');
  const allClocks = [
    'CarClock12',
    'CarClock24',
    'Blank',
    'Clock3',
    'Clock4',
    'Clock5'
  ];

  return (
    <div className="clocks">
      <ClockContextProvider>
        <ClockContext.Consumer>
          {({ timeModifier, setTimeModifier }) => (
            <>
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
                currentPage={clockSelected === 'default' ? 'CarClock12' : clockSelected} 
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
                />
              </div>
            </>
          )}
        </ClockContext.Consumer>
      </ClockContextProvider>
    </div>
  );
}