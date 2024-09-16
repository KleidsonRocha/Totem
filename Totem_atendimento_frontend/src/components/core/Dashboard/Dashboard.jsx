import React, { useState, useEffect } from 'react';
import HamburgerMenu from '../../hamburguerButton/HamburgerMenu';
import Footer from '../../footer/footer';
import { io } from 'socket.io-client';
import './Dashboard.css'

const socket = io('http://192.168.10.35:9000');

// Componente Principal
const Dashboard = () => {
  const [ticketImpresso, setTicketImpresso] = useState(0);
  const [ticket, setTicket] = useState(0);
  const [lastTicketNumber, setLastTicketNumber] = useState(null); 
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Conectado ao servidor');
    });

    socket.on('ticket_atualizado', (data) => {
      const newTicketNumber = data.ticket_atual;
      setTicket(newTicketNumber);
      
      if (newTicketNumber !== lastTicketNumber) {
        playAlertSound(newTicketNumber);
        setLastTicketNumber(newTicketNumber); 
      }
    });

    // Escuta atualizações de tickets impressos
    socket.on('ticket_impresso_atualizado', (data) => {
      setTicketImpresso(data.ticket_impresso);
    });

    


    return () => {
      socket.off('ticket_atualizado');
      socket.off('ticket_impresso_atualizado');
    };
  }, [lastTicketNumber]); 

  // Função para tocar o som com o número do ticket
  const playAlertSound = (ticketNumber) => {
    const utterance = new SpeechSynthesisUtterance(`Ticket número ${ticketNumber}`);
    utterance.lang = 'pt-BR'; // Define o idioma se necessário
    window.speechSynthesis.speak(utterance);
  };

  
  return (
    <>
      <HamburgerMenu />
      <div className='dashboard'>
        <h1 className='TicketDashboard'>{ticket}</h1>
        <ul>
            {orders.map(order => (
                <li key={order.id}>
                    Pedido ID: {order.id} - Status: {order.status}
                </li>
            ))}
        </ul>
      </div>
      
      <Footer />
    </>
  );
};

export default Dashboard;
