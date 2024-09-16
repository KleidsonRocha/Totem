import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/core/Home";
import Devolucao from "./components/core/Devolucao";
import Ticket from "./components/core/Atendimento/Ticket";
import Dashboard from "./components/core/Dashboard/Dashboard";
import Login from "./components/login/Login";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/Devolucao" element={<Devolucao />} />
        <Route path="/Login" element={<Login />} />

        {/* Rotas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/Ticket" element={<Ticket />} />
          <Route path="/Dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
