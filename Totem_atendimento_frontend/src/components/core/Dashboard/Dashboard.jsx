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
  const [pedidos, setPedidos] = useState([]);

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
      setPedidos(data)
    });
  
    return () => {
      socket.off('novo_ticket_chamado');
      socket.off('atualizacao_pedidos');
    };
  }, []);

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
          {pedidos.map((pedido, index) => (
            <li key={index}>
              <p className='dashboardPedidosItem'>{pedido.nm_tarefa_monitor}</p>
            </li>
          ))}
        </ul>
        <div>
          <img src="src\assets\SOCCOL.png" alt="logo_soccol" className='dashboardImg'/>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
