import React from 'react';
import ButtonTicket from '../buttons/buttonTicket';
import HamburgerMenu from '../hamburguerButton/HamburgerMenu';
import './main.css';
import Footer from '../footer/footer';



// Componente Principal
const Home = () => {
  return (
    <>
      <HamburgerMenu />
      <ButtonTicket />
      <div className='carousel'>
        <section className='carousel_text'>
          <h1>MECÂNICO</h1>
          <p>compre pelo <strong>SITE </strong> ou <strong>WHATSAPP</strong></p>
          <p>acessando o Qr Code ao lado</p>    
        </section>
        <img src="src\assets\qr_code.png" alt="qr_code_soccol" className='img_qrcode'/>
      </div>
      <Footer />
    </>
  );
};

export default Home;
