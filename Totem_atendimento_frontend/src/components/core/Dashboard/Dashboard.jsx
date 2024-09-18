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
  const [pedidos, setPedidos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

    socket.on('atualizacao_pedidos', (data) => {   
      console.log(data);
      setPedidos(data);
      setCurrentIndex(0); // Resetar o índice quando a lista de pedidos for atualizada
    });
  
    return () => {
      socket.off('novo_ticket_chamado');
      socket.off('atualizacao_pedidos');
    };
  }, []);

  useEffect(() => {
    // Atualiza o índice a cada 5 segundos
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 3;
        return nextIndex < pedidos.length ? nextIndex : 0;
      });
    }, 5000); // Intervalo de 5 segundos

    return () => clearInterval(interval);
  }, [pedidos]);

  // Função para tocar o som com o número do ticket e nome do atendente
  const playAlertSound = (ticketNumber, attendantName) => {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === 'Microsoft Maria - Portuguese (Brazil)'); // Substitua pelo nome da voz desejada
   
    const utterance = new SpeechSynthesisUtterance(`Ticket número ${ticketNumber} atendido por ${attendantName}`);
    utterance.lang = 'pt-BR'; // Define o idioma
   
    if (voice) {
      utterance.voice = voice;
    }
  
    window.speechSynthesis.speak(utterance);
  };

  const pedidosParaExibir = pedidos.slice(currentIndex, currentIndex + 3);

  return (
    <>
      <HamburgerMenu />
      <div className='dashboard'>
        <div className='dashboardTicket'>
          <h1 className='Ticket'>Ticket</h1>
          <h1 className='Ticket'>{ticket}</h1>
          <h1 className='Ticket'>Atendente</h1>  
          <h1 className='Ticket'>{attendantName}</h1>  
        </div>
        <ul className='dashboardPedidos'>
          {pedidosParaExibir.map((pedido, index) => (
            <li key={index}>
              <p className='dashboardPedidosItem'>{pedido.nm_tarefa_monitor}</p>
            </li>
          ))}
        </ul>

      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
