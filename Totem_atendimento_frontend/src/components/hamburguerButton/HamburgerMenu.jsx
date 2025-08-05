import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HamburgerMenu.css';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guicheAtual, setGuicheAtual] = useState('');
  const [showGuicheDropdown, setShowGuicheDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o usuário está autenticado
    const token = sessionStorage.getItem('authToken');
    const guiche = sessionStorage.getItem('guicheSelecionado');

    setIsAuthenticated(!!token);
    setGuicheAtual(guiche || '');
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleGuicheDropdown = () => {
    setShowGuicheDropdown(!showGuicheDropdown);
  };

  const handleGuicheChange = (novoGuiche) => {
    // Atualiza o guichê no sessionStorage
    sessionStorage.setItem('guicheSelecionado', novoGuiche);
    setGuicheAtual(novoGuiche);
    setShowGuicheDropdown(false);

    // Opcional: mostrar uma mensagem de confirmação
    console.log(`Guichê alterado para: ${novoGuiche}`);
  };

  const handleLogout = () => {
    // Limpa todo o sessionStorage
    sessionStorage.clear();

    // Atualiza o estado
    setIsAuthenticated(false);
    setGuicheAtual('');

    // Fecha o menu
    setIsOpen(false);

    // Redireciona para a página inicial
    navigate('/Login');
  };

  // Fechar o menu se o usuário clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowGuicheDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gera array de guichês de 1 a 10
  const guiches = Array.from({ length: 10 }, (_, i) => i + 1);

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
              <a className="logout-link" onClick={handleLogout}>
                Sair da Conta
              </a>
              <br />
              <br />

              {/* Seção do Guichê */}
              {guicheAtual && (
                <div className="guiche-section">
                  <div className="guiche-info">
                    <span className="guiche-label">Guichê Atual:</span>
                    <span className="guiche-number">{guicheAtual}</span>
                  </div>

                  <div className="guiche-dropdown-container">
                    <button
                      className="guiche-change-btn"
                      onClick={toggleGuicheDropdown}
                    >
                      Alterar Guichê {showGuicheDropdown ? '▲' : '▼'}
                    </button>

                    {showGuicheDropdown && (
                      <div className="guiche-dropdown">
                        {guiches.map((numero) => (
                          <button
                            key={numero}
                            className={`guiche-option ${numero.toString() === guicheAtual ? 'active' : ''}`}
                            onClick={() => handleGuicheChange(numero.toString())}
                          >
                            Guichê {numero}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}


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