import React, { useState, useEffect } from 'react';
import './ButtonStyle.css';
import { ENDPOINTS } from '../../config';

function ButtonTicket() {
  const [isDisabled, setIsDisabled] = useState(false);

  const handleGenerateTicket = async () => {
    if (isDisabled) return; // Previne cliques duplos

    setIsDisabled(true); // Desativa o botão

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
      setIsDisabled(false); // Reativa o botão após o término da requisição
    }
  };

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
        disabled={isDisabled} // Botão é desativado enquanto a requisição está sendo feita
        className={`ticket-button ${isDisabled ? 'ticket-button-disabled' : ''}`} // Aplica o estilo de desativado
      >
        {isDisabled ? 'Imprimindo...' : 'Clique aqui para gerar uma senha'} {/* Texto do botão muda */}
      </button>
    </div>
  );
}

export default ButtonTicket;
