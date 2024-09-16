import React from 'react';
import './Popup.css'; // Supondo que o CSS esteja em Popup.css

const Popup = ({ message, onClose }) => {
  return (
    <div className="popupOverlay">
      <div className="popupContainer">
        <p className='messagePopUp'>{message}</p>
        <button className="ticket-button" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default Popup;
