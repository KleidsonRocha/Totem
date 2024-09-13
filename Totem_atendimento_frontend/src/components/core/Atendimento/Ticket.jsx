import React, { useState, useEffect } from 'react';
import HamburgerMenu from '../../hamburguerButton/HamburgerMenu';
import Footer from '../../footer/footer';
import "./Ticket.css";

// Componente Principal
const Ticket = () => {
  const [TicketImpresso, setTicketImpresso] = useState(0);
  const [ticket, setTicket] = useState(0);
  const [ticketAChamar, setticketAChamar] = useState(0);

  useEffect(() => {
    handleConsultaUltimoTicket();
  }, []);

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
        setTicketImpresso(data.ticket_atual);
        calcularTicketsAChamar(data.ticket_atual, ticket);
      } else {
        console.error('Falha ao obter o número do ticket');
      }
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error);
    }
  };

  const calcularTicketsAChamar = (TicketImpresso, ticket) => {
    const ticketsEsperando = TicketImpresso - ticket;
    setticketAChamar(ticketsEsperando);
  };

  const handleChamadaTicket = async () => {
    try {
      await handleConsultaUltimoTicket();

      // Verifica se há tickets disponíveis
      if (ticket >= TicketImpresso) {
        alert("Não há mais tickets para chamar.");
        return;
      }

      const novoTicket = ticket + 1;
      setTicket(novoTicket);
      alert(`Chamar ticket: ${novoTicket}`);

      // Atualiza o número de tickets restantes para chamar
      calcularTicketsAChamar(TicketImpresso, novoTicket);
    } catch (error) {
      console.error('Erro ao chamar o ticket:', error);
    }
  };

  return (
    <>
      <HamburgerMenu />
      <div className='carousel'>
        <h1>Ticket Atual: {ticket}</h1>
        <br />
        <br />
        <h1>Há {ticketAChamar} para chamar</h1>
        <button onClick={handleChamadaTicket}>Chamar Ticket</button>
      </div>
      <Footer />
    </>
  );
};

export default Ticket;
