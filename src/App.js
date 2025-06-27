import React from 'react';
import './App.css';
import Navigation from './components/navigation/Navigation';
import { AppContext } from './AppContext';
import Loader from './components/loader/Loader';
import PopUpMessage from './components/popUpMessage/PopUpMessage';
import Header from './components/header/Header';

/**
 * 
 * Types of notes:
 *  - square: shows titles and content (default)
 *  - titles: only shows titles and details (date, characters)
 *  - all
 */

function App() {
  const consumeContext = React.useContext(AppContext);
  const { setType, type } = consumeContext;

  const allTypes = [
    'square',
    'titles',
    'all',
  ]

  const pages = [
    'ListNotes',
    'Blank',
    'Clocks',
  ];

  return (
    <div className="app" >
      {/**<Header setType={setType} allTypes={allTypes} type={type} /> */}
      <Navigation 
        pages={pages} 
        currentPage={consumeContext.currentPage === 'default' ? 'Clocks' : consumeContext.currentPage} 
        rootPath='pages'  // Adjust the path to Navigation.js
      />
      <Loader />
      <PopUpMessage />
    </div>
  );
}

export default App;