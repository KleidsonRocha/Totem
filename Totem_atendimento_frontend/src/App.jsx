import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/core/Home";
import Devolucao from "./components/core/Devolucao";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Devolucao" element={<Devolucao />} />
      </Routes>
    </Router>
  );
}

export default App;
