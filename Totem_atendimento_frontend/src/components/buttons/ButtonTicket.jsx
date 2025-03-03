import React, { useState, useEffect } from 'react';
import './ButtonStyle.css';
import { ENDPOINTS } from '../../config';

function ButtonTicket() {
  const [isDisabled, setIsDisabled] = useState(false);

  const handleGenerateTicket = async () => {
    if (isDisabled) return;
    setIsDisabled(true);

    try {
      const response = await fetch(ENDPOINTS.imprimirAtendimento, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Ticket gerado:', data);
      } else {
        console.error('Erro ao gerar o ticket:', response.status);
      }
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error);
    } finally {
      setIsDisabled(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleGenerateTicket();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDisabled]);

  const saveTickets = async () => {
    try {
      await fetch(ENDPOINTS.salvarTicket, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Erro ao salvar ticket:', error);
    }
  };

  const checkTimeAndReset = async () => {
    const now = new Date();
    if ((now.getHours() === 11 && now.getMinutes() === 58) || (now.getHours() === 18 && now.getMinutes() === 10)) {
      await saveTickets();
    }
  };

  useEffect(() => {
    const interval = setInterval(checkTimeAndReset, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ticketContainer">
      <button
        onClick={handleGenerateTicket}
        disabled={isDisabled}
        className={`ticket-button ${isDisabled ? 'ticket-button-disabled' : ''}`}
      >
        {isDisabled ? 'Imprimindo...' : 'Clique aqui para gerar uma senha'}
      </button>
    </div>
  );
}

export default ButtonTicket;