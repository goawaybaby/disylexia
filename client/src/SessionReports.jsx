import React from 'react';
import { useLocation } from 'react-router-dom';


const SessionReport = () => {
  const location = useLocation();
  const { memoryGameScore } = location.state || {};

  const labels = ["Memory Game"];
  const scores = [memoryGameScore || 0];

  return (
    <div>
      <h1>Session Report</h1>
      
    </div>
  );
};

export default SessionReport;
