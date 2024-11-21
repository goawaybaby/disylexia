import React, { useContext } from 'react';
import { UserContext } from '../pages/userContext';

const Home = () => {
  const { isLoggedIn, logout } = useContext(UserContext);

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <br />
      {isLoggedIn ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
};


export default Home;

