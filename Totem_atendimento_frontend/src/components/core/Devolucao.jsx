import React from 'react';
import HamburgerMenu from '../hamburguerButton/HamburgerMenu';
import './main.css';
import Footer from '../footer/footer';



// Componente Principal
const Devolucao = () => {
  return (
    <>
      <HamburgerMenu />
      <div className='holder_infos'>
        <h1 className='title_devolucao_h1'><strong>Para devoluções ir</strong></h1>
        <h1 className='title_devolucao'><strong>ao lado do caixa</strong></h1>
      <p className='informativo'>Não é necessário a retirada de ticket para isso</p>
      </div>
      <Footer />
    </>
  );
};

export default Devolucao;
