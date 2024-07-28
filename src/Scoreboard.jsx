import React from 'react';
import './Scoreboard.css';

function Scoreboard({ scores }) {
  // Limited to 5 rows
  const displayedScores = scores.slice(0, 5);

  return (
    <div className="scoreboard">
      <h2>Scoreboard</h2>
      <table>
        <thead>
          <tr>
            <th>Initials</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {displayedScores.map((scoreEntry, index) => (
            <tr key={index}>
              <td>{scoreEntry.initials}</td>
              <td>{scoreEntry.score_num}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Scoreboard;
