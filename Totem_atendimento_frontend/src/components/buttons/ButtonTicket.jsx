import React, { useState, useEffect } from 'react';
import './ButtonStyle.css';

function ButtonTicket() {
  const [ticketNumber, setTicketNumber] = useState(1); 
  const [isDisabled, setIsDisabled] = useState(false); // Novo estado para controle de desativação

  // Função que será chamada quando o botão for clicado
  const handleGenerateTicket = async () => {
    if (isDisabled) return; // Não faz nada se o botão estiver desativado

    setIsDisabled(true); // Desativa o botão
    try {
      const response = await fetch('http://192.168.10.57:9000/imprimir_atendimento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numero: ticketNumber }),
      });

      if (response.ok) {
        setTicketNumber(ticketNumber + 1); 
      } else {
        alert('Falha ao gerar o ticket. Chame o suporte Técnico');
      }
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error);
    } finally {
      setIsDisabled(false);
    }
  };

  const saveTickets = async (QTDticket) => {
    try {
      await fetch('http://192.168.10.57:9000/salvar_ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantidade_ticket: QTDticket }),
      });
    } catch (error) {
      console.error("Erro ao salvar ticket: ", error);
    }
  }

  const checkTimeAndReset = async () => { 
    const now = new Date();
  
    if (now.getHours() === 11 && now.getMinutes() === 58) {
      
      await saveTickets((ticketNumber -1)); 
      setTicketNumber(1); 
    }

    if (now.getHours() === 18 && now.getMinutes() === 58) {
      
      await saveTickets((ticketNumber -1)); 
      setTicketNumber(1); 
    }
  };
  
  useEffect(() => {
    const interval = setInterval(checkTimeAndReset, 60000); // 60000ms = 1 minuto
  
    return () => clearInterval(interval); 
  }, [ticketNumber]);
  

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
