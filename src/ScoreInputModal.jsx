import React, { useState } from 'react';
import './ScoreInputModal.css';

const ScoreInputModal = ({ isOpen, onSubmit }) => {
  const [initials, setInitials] = useState('');

  const handleSubmit = () => {
    onSubmit(initials);
  };

  // Function to check if the initials input is valid
  const isInputValid = () => {
    // Check if initials length is 3 characters
    return initials.length === 3;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Enter Your Initials</h2>
        <input
          type="text"
          maxLength="3"
          value={initials}
          onChange={(e) => setInitials(e.target.value.toUpperCase())}
        />
        <div className="modal-button">
          <button onClick={handleSubmit} disabled={!isInputValid()}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default ScoreInputModal;
