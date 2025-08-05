import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './GuicheSelection.css';
import HamburgerMenu from '../../hamburguerButton/HamburgerMenu';
import Footer from '../../footer/footer';

const GuicheSelection = () => {
  const [selectedGuiche, setSelectedGuiche] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSelecionarGuiche = (e) => {
    e.preventDefault();

    if (!selectedGuiche) {
      setError('Por favor, selecione um guichê');
      return;
    }

    // Salva o guichê selecionado na sessão
    sessionStorage.setItem('guicheSelecionado', selectedGuiche);
    navigate('/Ticket');
  };

  // Gera array de guichês de 1 a 10
  const guiches = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <>
      <HamburgerMenu />
      <div className="guicheContainer">
        <h2>Selecione o Guichê</h2>
        <form onSubmit={handleSelecionarGuiche}>
          <div className="formGroup">
            <label htmlFor="guiche">Guichê:</label>
            <select
              id="guiche"
              value={selectedGuiche}
              onChange={(e) => setSelectedGuiche(e.target.value)}
              required
            >
              <option value="">Selecione um guichê</option>
              {guiches.map((numero) => (
                <option key={numero} value={numero}>
                  Guichê {numero}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="botaoGuiche" type="submit">
            Confirmar Guichê
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default GuicheSelection;