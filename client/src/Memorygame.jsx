import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './emorygame.css'; // Include your styles if any

const MemoryGame = () => {
  const [boxes, setBoxes] = useState([]);
  const [openBoxes, setOpenBoxes] = useState([]);
  const [matchedBoxes, setMatchedBoxes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledBoxes = shuffleArray([
      ...Array.from({ length: 8 }, (_, i) => i),
      ...Array.from({ length: 8 }, (_, i) => i),
    ]);
    setBoxes(shuffledBoxes);
    setOpenBoxes([]);
    setMatchedBoxes([]);
    setGameOver(false);
    setScore(0);
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleBoxClick = (index) => {
    if (openBoxes.length < 2 && !openBoxes.includes(index) && !matchedBoxes.includes(index)) {
      const newOpenBoxes = [...openBoxes, index];
      setOpenBoxes(newOpenBoxes);

      if (newOpenBoxes.length === 2) {
        const [first, second] = newOpenBoxes;
        if (boxes[first] === boxes[second]) {
          setMatchedBoxes([...matchedBoxes, first, second]);
          setScore(score + 10);
        }

        setTimeout(() => {
          setOpenBoxes([]);
          if (matchedBoxes.length + 2 === boxes.length) {
            setGameOver(true);
            saveGameScore();
          }
        }, 1000);
      }
    }
  };

  const saveGameScore = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/save-score', { score });
      console.log('Game score saved:', response.data);
    } catch (error) {
      console.error('Failed to save game score:', error);
    }
  };

  return (
    <div className="memory-game">
      <h1>Memory Game</h1>
      <div className="score">Score: {score}</div>
      <div className="grid">
        {boxes.map((value, index) => (
          <div
            key={index}
            className={`box ${openBoxes.includes(index) || matchedBoxes.includes(index) ? 'open' : ''}`}
            onClick={() => handleBoxClick(index)}
          >
            {(openBoxes.includes(index) || matchedBoxes.includes(index)) && value}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Your final score: {score}</p>
          <button onClick={initializeGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
