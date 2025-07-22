import React, { useState, useEffect } from 'react';
import HamburgerMenu from '../../hamburguerButton/HamburgerMenu';
import Footer from '../../footer/footer';
import { io } from 'socket.io-client';
import './Dashboard.css';
import { ENDPOINTS } from '../../../config';

const socket = io(ENDPOINTS.socketIO);

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
    const voices = window.speechSynthesis.getVoices();

    // Procura por vozes femininas em português
    const femaleVoices = voices.filter(v =>
      v.lang.includes('pt') &&
      (v.name.includes('Maria') ||
        v.name.includes('Fernanda') ||
        v.name.includes('female') ||
        v.name.includes('Female'))
    );

    const utterance = new SpeechSynthesisUtterance(
      `Ticket número ${ticketNumber}, favor dirigir-se ao atendente ${attendantName}`
    );

    // Configurações para voz mais sensual/atrativa
    utterance.lang = 'pt-BR';
    utterance.rate = 0.8;     // Velocidade mais lenta (sensual)
    utterance.pitch = 0.7;    // Tom mais grave
    utterance.volume = 1.0;   // Volume máximo

    // Usa a primeira voz feminina encontrada
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
          <h1 className='Ticket'>Número</h1>
          <h1 className='Ticket'>{ticket}</h1>
          <h1 className='Ticket'>Atendente</h1>
          <h1 className='Ticket'>{attendantName}</h1>
        </div>
      </div>

    </>
  );
};

export default Dashboard;
