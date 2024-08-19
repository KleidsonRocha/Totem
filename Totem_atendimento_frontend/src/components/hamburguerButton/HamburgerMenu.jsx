import React, { useState, useEffect, useRef } from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);  // Cria uma referência para o menu

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
          <a href="/">Retirar senha</a>
          <a href="/Devolucao">Devolução de peças</a>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
