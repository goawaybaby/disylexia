import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css' 

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/register" className="nav-link">Register</Link>
      <Link to="/login" className="nav-link">Login</Link>
      <Link to="/memorygame" className="nav-link">Memory Game</Link>
      
      
    </nav>
  );
}

