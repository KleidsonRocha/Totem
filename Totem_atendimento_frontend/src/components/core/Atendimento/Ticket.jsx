import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import HamburgerMenu from '../../hamburguerButton/HamburgerMenu';
import Footer from '../../footer/footer';
import "./Ticket.css";
import Popup from '../../popup/Popup';
import { ENDPOINTS } from '../../../config';

const socket = io(ENDPOINTS.socketIO);

const Ticket = () => {
  const [ticketImpresso, setTicketImpresso] = useState(0);
  const [ticket, setTicket] = useState(0);
  const [ticketAChamar, setTicketAChamar] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const authToken = sessionStorage.getItem('Nome');
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = sessionStorage.getItem('authToken');
    const guicheSelecionado = sessionStorage.getItem('guicheSelecionado');
    if (!authToken) {
      navigate('/login');
      return;
    }

    if (!guicheSelecionado) {
      navigate('/selecionar-guiche');
      return;
    }

    handleConsultaUltimoTicket();
    handleVerificaTicketImpresso();

    // Escuta atualizações de tickets chamados
    socket.on('ticket_atualizado', (data) => {
      setTicket(data.ticket_atual);
      calcularTicketsAChamar(ticketImpresso, data.ticket_atual);
    });

    // Escuta atualizações de tickets impressos
    socket.on('ticket_impresso_atualizado', (data) => {
      setTicketImpresso(data.ticket_impresso);
      calcularTicketsAChamar(data.ticket_impresso, ticket);
    });

    return () => {
      socket.off('ticket_atualizado');
      socket.off('ticket_impresso_atualizado');
    };
  }, [ticketImpresso]);

  const handleVerificaTicketImpresso = async () => {
    try {
      const response = await fetch(ENDPOINTS.ticketImpresso, {
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
      const response = await fetch(ENDPOINTS.ticketAtual, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        calcularTicketsAChamar(data.ticket_atual, ticket);
        setTicket(data.ticket_atual);
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
      if (ticket >= ticketImpresso) {
        setPopupTitle('Erro');
        setPopupMessage('Não há mais tickets para chamar.');
        setShowPopup(true);
        return;
      }

      const response = await fetch(ENDPOINTS.chamarTicket, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPopupTitle('Ticket Chamado');
        setPopupMessage(`Chamar ticket: ${data.ticket_atual}`);
        setShowPopup(true);
        setTicket(data.ticket_atual);
        calcularTicketsAChamar(ticketImpresso, data.ticket_atual);

        // Emite o evento incluindo o guichê
        socket.emit('novo_ticket_chamado', {
          ticketNumber: data.ticket_atual,
          attendantName: authToken,
          guiche: sessionStorage.getItem('guicheSelecionado') // Adicione esta linha
        });
      } else {
        setPopupTitle('Erro');
        setPopupMessage('Não foi possível chamar o ticket.');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Erro ao chamar o ticket:', error);
      setPopupTitle('Erro');
      setPopupMessage('Erro ao chamar o ticket.');
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => setShowPopup(false);

  const temTicketsParaChamar = ticket < ticketImpresso;
  const qtdTicketsParaChamar = ticketImpresso - ticket;

  return (
    <>
      <HamburgerMenu />
      <div className='carouselTicket'>
        <h1 className='TKTAtual'>Ticket Atual: {ticket}</h1>
        <br />
        <h1 className='TKTFila'>Há {qtdTicketsParaChamar} tickets para chamar</h1>
        <button
          className='buttonAtendimento'
          onClick={handleChamadaTicket}
          disabled={!temTicketsParaChamar}
        >
          Chamar Ticket
        </button>
      </div>
      {showPopup && (
        <Popup
          title={popupTitle}
          message={popupMessage}
          onClose={handleClosePopup}
        />
      )}
      <Footer />
    </>
  );
};

export default Ticket;
