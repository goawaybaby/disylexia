import React, { useContext } from 'react';
import { UserContext } from '../../context/userContext';

const Home = () => {
  const { isLoggedIn, logout } = useContext(UserContext);

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <br />
      {isLoggedIn && (
        <button onClick={logout}>Logout</button>
      )}
    </div>
  );
};

export default Home;

