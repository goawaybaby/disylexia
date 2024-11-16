import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#F3FF33', '#33FFF6', '#A6FF33', '#33A6FF'];

function MemoryGame({ onFinish }) {
  const [grid, setGrid] = useState(Array(16).fill(null));
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [score, setScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(15);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [revealed, setRevealed] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initializeGrid();
    const revealTimeout = setTimeout(() => {
      setRevealed(false);
    }, 5000);
    return () => clearTimeout(revealTimeout);
  }, []);

  function initializeGrid() {
    let tempGrid = Array(16).fill(null);
    let pairs = [...colors, ...colors];
    pairs = pairs.sort(() => Math.random() - 0.5);

    pairs.forEach((color, index) => {
      tempGrid[index] = color;
    });

    setGrid(tempGrid);
  }

  function handleBoxClick(index) {
    if (selectedBoxes.length < 2 && !selectedBoxes.includes(index) && !matchedPairs.includes(grid[index])) {
      const newSelected = [...selectedBoxes, index];
      setSelectedBoxes(newSelected);
      if (newSelected.length === 2) {
        checkMatch(newSelected);
      }
    }
  }

  async function checkMatch(newSelected) {
    const [first, second] = newSelected;

    if (grid[first] === grid[second]) {
      setMatchedPairs([...matchedPairs, grid[first]]);
      setScore(score + 1);
      setSelectedBoxes([]);
    } else {
      setTimeout(() => setSelectedBoxes([]), 1000);
      
    }

    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    if (newAttemptsLeft === 0) {
      alert('Game Over! Out of attempts.');
      await finishGame();
    } else if (score + 1 === 8) {
      alert('Congratulations! You win!');
      await finishGame();
    }
  }

  async function finishGame() {
    await sendScoreToBackend(score);
    navigate('/session-report', { state: { memoryGameScore: score } });
  }

  async function sendScoreToBackend(finalScore) {
    try {
      await axios.post('/api/save-score', { score: finalScore }, { withCredentials: true });
      console.log('Score saved successfully');
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  }

  return (
    <div>
      <h1>Memory Game</h1>
      <h2>Score: {score}</h2>
      <h2>Attempts Left: {attemptsLeft}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', width: '320px', margin: '0 auto' }}>
        {grid.map((color, index) => (
          <div
            key={index}
            className="box"
            style={{
              width: '70px',
              height: '70px',
              margin: '5px',
              backgroundColor: revealed || selectedBoxes.includes(index) || matchedPairs.includes(color)
                ? color
                : '#ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onClick={() => handleBoxClick(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default MemoryGame;
