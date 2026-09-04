import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Pokemonapi from './components/Pokemonapi/Pokemonapi';
import Login from './components/Login/Login';
import BattleArena from './components/Battle/BattleArena';
import withAuthorization from './components/Auth/withAuthorization';
import { MyContextProvider } from './components/MyContext';

const ProtectedBattleArena = withAuthorization(BattleArena);

function App() {
  return (
    <MyContextProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/Pokemon" element={<Pokemonapi />} />
            <Route path="/battle" element={<ProtectedBattleArena />} />
            <Route path="/" element={<Navigate to="/Pokemon" replace />} />
            <Route path="*" element={<Navigate to="/Pokemon" replace />} />
          </Routes>
        </Router>
      </div>
    </MyContextProvider>
  );
}

export default App;
