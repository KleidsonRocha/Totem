import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from '../hamburguerButton/HamburgerMenu';
import Footer from '../footer/footer';
import './Login.css';
import { ENDPOINTS } from '../../config';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.toUpperCase(), 
          password
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer login');
      }

      const data = await response.json();

      sessionStorage.setItem('authToken', data.success.cd_usuario);
      sessionStorage.setItem('userData', data.success.login);
      sessionStorage.setItem('Nome', data.success.nome_funcionario.split(' ')[0]);

      navigate('/Ticket'); 

    } catch (error) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <>
      <HamburgerMenu />

      <div className="loginContainer">
        <form onSubmit={handleLogin}>
          <div className="formGroup">
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())} 
              required
            />
          </div>
          <div className="formGroup">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button className='botaoLogin' type="submit">Login</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Login;
