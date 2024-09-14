import React, { useState, useEffect } from 'react';
import HamburgerMenu from '../../hamburguerButton/HamburgerMenu';
import Footer from '../../footer/footer';
import "./Ticket.css";

// Componente Principal
const Ticket = () => {
  const [ticketImpresso, setTicketImpresso] = useState(0);
  const [ticket, setTicket] = useState(0);
  const [ticketAChamar, setTicketAChamar] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      handleConsultaUltimoTicket();
      handleVerificaTicketImpresso();

    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVerificaTicketImpresso = async () => {
    try {
      const response = await fetch('http://192.168.10.35:9000/ticket_impresso', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTicketImpresso(data.ticket_atual);
      } else {
        console.error('Falha ao obter o número do ticket impresso');
      }
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error);
    }
  };

  const handleConsultaUltimoTicket = async () => {
    try {
      const response = await fetch('http://192.168.10.35:9000/ticket_atual', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        calcularTicketsAChamar(data.ticket_atual, ticket);
        setTicket(data.ticket_atual)
      } else {
        console.error('Falha ao obter o número do ticket');
      }
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error);
    }
  };

  const calcularTicketsAChamar = (ticketImpresso, ticket) => {
    const ticketsEsperando = ticketImpresso - ticket;
    setTicketAChamar(ticketsEsperando);
  };

  const handleChamadaTicket = async () => {
    try {
      // Verifica se há tickets impressos que podem ser chamados
      if (ticket >= ticketImpresso) {
        alert("Não há mais tickets para chamar.");
        return;
      }
      // Envia solicitação para chamar o próximo ticket
      const response = await fetch('http://192.168.10.35:9000/chamar_ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Chamar ticket: ${data.ticket_atual}`);
        setTicket(data.ticket_atual);
        calcularTicketsAChamar(ticketImpresso, data.ticket_atual);
      } else {
        console.error('Falha ao chamar o ticket');
      }
    } catch (error) {
      console.error('Erro ao chamar o ticket:', error);
    }
  };

  // Verifica se há tickets disponíveis para chamar
  const temTicketsParaChamar = ticket < ticketImpresso;
  const qtdTicketsParaChamar = ticketImpresso - ticket

  return (
    <>
      <HamburgerMenu />
      <div className='carouselTicket'>
        <h1>Ticket Atual: {ticket}</h1>
        <br/>
        <h1>Há {qtdTicketsParaChamar} tickets para chamar</h1>
        <button 
          className='buttonAtendimento'
          onClick={handleChamadaTicket} 
          disabled={!temTicketsParaChamar}
        >
          Chamar Ticket
        </button>
      </div>
      <Footer />
    </>
  );
};

export default Ticket;