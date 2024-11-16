import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const StartScreen = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if there's a token in cookies to update login status
    const token = Cookies.get('token');
    console.log("Token:", token); // Debugging line
    setIsLoggedIn(!!token); // Sets true if token exists, otherwise false
  }, []);

  const handlePlayGame = () => {
    if (isLoggedIn) { 
      navigate("/memorygame");
    } else {
      navigate("/memorygame");
    }
  };

  return (
    <div className="start-screen">
      <h1>Memory Game</h1>
      <br />
      <button onClick={handlePlayGame}>PLAY GAME</button>
    </div>
  );
};

export default StartScreen;

