import React from 'react';

export const ClockContext = React.createContext();

export default function ClockContextProvider({ children }) {
  const [timestamp, setTimestamp] = React.useState(Date.now());
  const [timeModifier, setTimeModifier] = React.useState(0);
  const [format, setFormat] = React.useState('12');
  const [isSliderActive, setIsSliderActive] = React.useState(false);

  // Update the timestamp every second to force a re-render
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  });

  const contextValue = {
    timestamp,
    setTimestamp,
    timeModifier,
    setTimeModifier,
    format,
    setFormat,
    isSliderActive,
    setIsSliderActive,
  };

  return (
    <ClockContext.Provider value={contextValue}>
      {children}
    </ClockContext.Provider>
  );
}