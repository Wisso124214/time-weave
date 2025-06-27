import React from 'react';
import './PopUpMessage.css';
import { AppContext } from '@src/AppContext';

export default function PopUpMessage() {

  const { popUpMessage } = React.useContext(AppContext);
  const { isVisible, content, onClose, buttonText } = popUpMessage;

  return (
    <div className={`pop-up-message ${isVisible ? 'visible' : ''}`}>
      <div className={`pop-up-content-message ${isVisible ? 'visible' : ''}`}>
        <p>{content}</p>
        <button className="default-button pop-up-close-button" onClick={onClose}>{buttonText}</button>
      </div>
    </div>
  );
}