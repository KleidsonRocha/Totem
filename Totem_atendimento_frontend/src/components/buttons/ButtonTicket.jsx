import React, { useState, useEffect } from 'react';
import './ButtonStyle.css';

function ButtonTicket() {
  const [isDisabled, setIsDisabled] = useState(false); // Novo estado para controle de desativação

  // Função que será chamada quando o botão for clicado
  const handleGenerateTicket = async () => {
    if (isDisabled) return; // Não faz nada se o botão estiver desativado
  
    setIsDisabled(true); // Desativa o botão
    try {
      const response = await fetch('http://192.168.10.35:9000/imprimir_atendimento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();

      } else {

      }
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error);
    } finally {
      setIsDisabled(false);
    }
  };

  const saveTickets = async () => {
    try {
      await fetch('http://192.168.10.35:9000/salvar_ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Erro ao salvar ticket: ", error);
    }
  }

  const checkTimeAndReset = async () => { 
    const now = new Date();
  
    if ((now.getHours() === 11 && now.getMinutes() === 58) || (now.getHours() === 18 && now.getMinutes() === 10)) {
      await saveTickets(); 
    }
  };
  
  useEffect(() => {
    const interval = setInterval(checkTimeAndReset, 60000); // Verifica a cada minuto
    return () => clearInterval(interval); 
  }, []);  // Remove a dependência ticketNumber, já que ele não é mais usado
  

  return (
    <div className='ticketContainer'>
      <button 
        onClick={handleGenerateTicket} 
        disabled={isDisabled} 
        className={`ticket-button ${isDisabled ? 'ticket-button-disabled' : ''}`}
      >
        Clique aqui para gerar uma senha
      </button>
    </div>
  );
}

export default ButtonTicket;
