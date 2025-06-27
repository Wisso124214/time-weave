import React from 'react';
import App from './App';

export const AppContext = React.createContext();

function AppContextProvider() {
  const [currentPage, setCurrentPage] = React.useState('default');
  const [type, setType] = React.useState('default');
  const [loading, setLoading] = React.useState(false);
  const [popUpMessage, setPopUpMessage] = React.useState({
    isVisible: false,
    content: '',
    buttonText: 'Close',
    onClose: () => setPopUpMessage(prev => ({ ...prev, isVisible: false })),
  });

  let contextValue = {
    currentPage,
    setCurrentPage,
    type,
    setType,
    loading,
    setLoading,
    popUpMessage,
    setPopUpMessage,
  }

  return (
    <AppContext.Provider value={contextValue}>
      <App />
    </AppContext.Provider>
  );
}

export default AppContextProvider;
