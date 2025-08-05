import React, { useState, useEffect } from 'react';
import HamburgerMenu from '../../hamburguerButton/HamburgerMenu';
import Footer from '../../footer/footer';
import { io } from 'socket.io-client';
import './Dashboard.css';
import { ENDPOINTS } from '../../../config';

const socket = io(ENDPOINTS.socketIO);

const Dashboard = () => {
  const [ticket, setTicket] = useState(0);
  const [attendantName, setAttendantName] = useState('');
  const [guiche, setGuiche] = useState(''); // Adicione este estado

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Conectado ao servidor');
    });

    // Escuta atualizações de tickets chamados
    socket.on('novo_ticket_chamado', (data) => {
      setTicket(data.ticketNumber);
      setAttendantName(data.attendantName);
      setGuiche(data.guiche || 'N/A'); // Adicione esta linha
      playAlertSound(data.ticketNumber, data.guiche); // Modifique esta linha
    });

    return () => {
      socket.off('novo_ticket_chamado');
    };
  }, []);

  // Modifique a função playAlertSound
  const playAlertSound = (ticketNumber, guiche) => {
    const voices = window.speechSynthesis.getVoices();

    const femaleVoices = voices.filter(v =>
      v.lang.includes('pt') &&
      (v.name.includes('Maria') ||
        v.name.includes('Fernanda') ||
        v.name.includes('female') ||
        v.name.includes('Female'))
    );

    const utterance = new SpeechSynthesisUtterance(
      `Ticket número ${ticketNumber}, favor dirigir-se ao guichê ${guiche}`
    );

    utterance.lang = 'pt-BR';
    utterance.rate = 0.8;
    utterance.pitch = 0.7;
    utterance.volume = 1.0;

    if (femaleVoices.length > 0) {
      utterance.voice = femaleVoices[0];
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <HamburgerMenu />
      <div className='dashboard'>
        <div className='dashboardTicket'>
          <h1 className='Ticket'>Número: {ticket}</h1>
          <h1 className='Ticket'>Guichê: {guiche}</h1>
          <h1 className='Ticket'>Atendente: {attendantName}</h1>
        </div>
      </div>
    </>
  );
};

export default Dashboard;