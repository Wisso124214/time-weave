import React from 'react';

export const ClockContext = React.createContext();

export default function ClockContextProvider({ children }) {
  const [timestamp, setTimestamp] = React.useState(Date.now());
  const [timeModifier, setTimeModifier] = React.useState(0);

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
  };

  return (
    <ClockContext.Provider value={contextValue}>
      {children}
    </ClockContext.Provider>
  );
}