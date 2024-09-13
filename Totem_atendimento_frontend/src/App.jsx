import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/core/Home";
import Devolucao from "./components/core/Devolucao";
import Ticket from "./components/core/Atendimento/Ticket";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Devolucao" element={<Devolucao />} />
        <Route path="/Ticket" element={<Ticket />} />
      </Routes>
    </Router>
  );
}

export default App;
