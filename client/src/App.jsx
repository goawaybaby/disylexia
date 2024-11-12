import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import Header from '../src/components/Header';
import Navbar from '../src/components/Navbar';
import Home from '../src/pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StartScreen from './StartScreen.jsx';
import MemoryGame from './Memorygame.jsx';
import { UserContextProvider } from '../context/userContext';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App() {
  const [gameStage, setGameStage] = useState('start');
  const [score, setScore] = useState(0);
  const [sessionData, setSessionData] = useState({});

  useEffect(() => {
    // Set up any necessary initialization logic (e.g., axios setup)
  }, []);

  const handleMemoryGame = () => setGameStage('memoryGame');
  const handleFinishMemoryGame = (memoryGameScore) => {
    setSessionData((prev) => ({ ...prev, memoryGameScore }));
    setGameStage('interface');
  };

  return (
    <UserContextProvider>
      <Header />
      <Navbar />
      <Toaster position="center" toastOptions={{ duration: 3000 }} />
      
      {/* Game and routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      {/* Conditional Rendering based on gameStage */}
      <div>
        {gameStage === 'start' && <StartScreen onStartQuiz={handleMemoryGame} />}
        {gameStage === 'memoryGame' && <MemoryGame onFinish={handleFinishMemoryGame} />}
        {gameStage === 'interface' && <AdminReport sessionData={sessionData} />}
      </div>
    </UserContextProvider>
  );
}

export default App;

