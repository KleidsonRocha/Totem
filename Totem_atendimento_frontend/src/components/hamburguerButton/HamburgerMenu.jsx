import React, { useState, useEffect, useRef } from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);  // Cria uma referência para o menu
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica se o usuário está autenticado
    const token = sessionStorage.getItem('authToken');
    setIsAuthenticated(!!token); // Define o estado baseado na presença do token
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Fechar o menu se o usuário clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='hamburger-container'>
      <div className='hamburger-menu' ref={menuRef}>
        <div className={`menu-icon ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <div className='bar1'></div>
          <div className='bar2'></div>
          <div className='bar3'></div>
        </div>
        <div className={`menu-content ${isOpen ? 'open' : ''}`}>
          {isAuthenticated && (
            <>
              <a href="/Ticket">Atendimentos</a>
              <a href="/Dashboard">Dashboard</a>
            </>
          )}
          {!isAuthenticated && (
            <>
              <a href="/">Retirar senha</a> 
              <a href="/Devolucao">Devolução de peças</a>
              <a href="/Login">Login</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
