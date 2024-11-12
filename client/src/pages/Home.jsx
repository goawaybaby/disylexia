import React from 'react'
import data from '../sample.json';

export default function Home() {

  const StartScreen = ({ onStartQuiz, onAdminLogin }) => {
    const [username, setUsername] = useState('');
    const [adminId, setAdminId] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
  
    const handlePlayGame = () => {
      const username = prompt("Please enter your username:");
      onStartQuiz(username);
    };
  
    
  }
  return (
    <div>
      <h2>
      Home
      </h2>
      
    </div>
  )
}
