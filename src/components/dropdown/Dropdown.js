import React from 'react';
import './Dropdown.css';

export default function Dropdown({ allOptions, optionSelected, setOptionSelected, defaultOption, styles }) {
  return (
    <div className="dropdown" style={styles.dropdown}>
      <div className='dropdown-container' style={styles.container}>
        <div className='dropdown-content' style={styles.content}>
          <select
            className='dropdown-select'
            style={styles.select}
            value={optionSelected === 'default' ? defaultOption : optionSelected}
            onChange={(e) => setOptionSelected(e.target.value)}
          >
            {allOptions.map((value) => (
              <option 
                className='dropdown-option' 
                key={value} 
                value={value} 
                style={styles.option}
                hover_color={styles.option?.hover}
              >
                {' '}
                {value}{' '}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}