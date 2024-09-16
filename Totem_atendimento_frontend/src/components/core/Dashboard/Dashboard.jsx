import React, { useState, useEffect } from 'react';
import HamburgerMenu from '../../hamburguerButton/HamburgerMenu';
import Footer from '../../footer/footer';
import { io } from 'socket.io-client';
import './Dashboard.css';

const socket = io('http://192.168.10.35:9000');

// Componente Principal
const Dashboard = () => {
  const [ticket, setTicket] = useState(0);
  const [attendantName, setAttendantName] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Conectado ao servidor');
    });
  
    // Escuta atualizações de tickets chamados
    socket.on('novo_ticket_chamado', (data) => {
      setTicket(data.ticketNumber);
      setAttendantName(data.attendantName);
      playAlertSound(data.ticketNumber, data.attendantName);
    });
  
    return () => {
      socket.off('novo_ticket_chamado');
    };
  }, []);

  // Função para tocar o som com o número do ticket e nome do atendente
  const playAlertSound = (ticketNumber, attendantName) => {
    const utterance = new SpeechSynthesisUtterance(`Ticket número ${ticketNumber} atendido por ${attendantName}`);
    utterance.lang = 'pt-BR'; // Define o idioma se necessário
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <HamburgerMenu />
      <div className='dashboard'>
        <h1 className='TicketDashboard'>Ticket Chamado: {ticket}</h1>
        <h1 className='TicketDashboard'>Atendente: {attendantName}</h1>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
