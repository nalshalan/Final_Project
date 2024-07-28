import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeMute, faVolumeUp, faMusic, faSlash } from '@fortawesome/free-solid-svg-icons';
import Canvas from './Canvas';
import Piece, { tetrominoes } from './Piece';
import ScoreInputModal from './ScoreInputModal';
import Scoreboard from './Scoreboard';
import './App.css';

import backgroundMusic from "../sounds/tetris-theme-music.mp3";

function getColorByShape(shape) {
  const colors = {
    I: 'yellow',
    J: 'purple',
    L: 'green',
    O: 'blue',
    S: 'red',
    T: 'orange',
    Z: 'cyan'
  };
  return colors[shape] || 'grey';
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextPiece, setNextPiece] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  const [showScoreInputModal, setShowScoreInputModal] = useState(false);
  const [scores, setScores] = useState([]);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSoundEffectsMuted, setIsSoundEffectsMuted] = useState(false);

  const audioRef = useRef(null);

  const startGame = () => {
    setGameStarted(true);
    setIsPaused(false);
    setIsGameOver(false);
    setScore(0);
    setLines(0);
    setLevel(selectedLevel);
    setNextPiece(getRandomPiece());
  };

  const togglePause = () => setIsPaused(prev => !prev);

  const quitGame = () => {
    setIsPaused(true);
    setShowQuitConfirmation(true);
  };

  const getRandomPiece = () => {
    const randIndex = Math.floor(Math.random() * tetrominoes.length);
    return {
      ...tetrominoes[randIndex],
      x: Math.floor(2 / 2) - Math.floor(tetrominoes[randIndex].coords[0].length / 2),
      y: 0,
      color: getColorByShape(tetrominoes[randIndex].shape),
    };
  };

  const handleLevelChange = (direction) => {
    setSelectedLevel((prevLevel) => {
      const newLevel = prevLevel + direction;
      if (newLevel < 1) return 1;
      if (newLevel > 10) return 10;
      return newLevel;
    });
  };

  useEffect(() => {
    if (gameStarted && !isMusicMuted && !isGameOver && !isPaused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [gameStarted, isMusicMuted, isGameOver, isPaused]);

  const fetchScores = async () => {
    try {
      const response = await fetch('http://localhost:5555/data/scores');
      if (!response.ok) {
        throw new Error('Failed to fetch scores');
      }
      const data = await response.json();
      setScores(data);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  const handleScoreSubmit = async (initials) => {
    try {
      const response = await fetch('http://localhost:5555/data/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ initials, score_num: score })
      });
      if (!response.ok) {
        throw new Error('Failed to save score');
      }
      await fetchScores(); // Refresh the scores after submitting
    } catch (error) {
      console.error('Error saving score:', error);
    }

    // Reset the game state
    setShowScoreInputModal(false);
    setIsGameOver(true);
  };

  const handleScoreCancel = () => {
    setShowScoreInputModal(false);
    setIsGameOver(true);
  };

  useEffect(() => {
    if (isGameOver) {
      setShowScoreInputModal(true);
    }
  }, [isGameOver]);

  useEffect(() => {
    fetchScores(); // Fetch scores when the component mounts
  }, []);

  useEffect(() => {
    setLevel(selectedLevel);
  }, [selectedLevel]);

  const toggleMusicMute = () => {
    setIsMusicMuted(!isMusicMuted);
  };

  const toggleSoundEffectsMute = () => {
    setIsSoundEffectsMuted(!isSoundEffectsMuted);
  };

  return (
    <div className="app">
      <audio ref={audioRef} src={backgroundMusic} loop />
      <img src="../images/tetris-logo.png" alt="Tetris Logo" className="logo" />
      <div className="game-container">
        <div className="board-container">
          {gameStarted && (
            <Canvas
              boardWidth={10}
              boardHeight={15}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              setScore={setScore}
              setLines={setLines}
              setLevel={setLevel}
              nextPiece={nextPiece}
              setNextPiece={setNextPiece}
              selectedLevel={selectedLevel}
              setIsGameOver={setIsGameOver}
              isGameOver={isGameOver}
              showQuitConfirmation={showQuitConfirmation}
              setShowQuitConfirmation={setShowQuitConfirmation}
              isMusicMuted={isMusicMuted}
              toggleMusicMute={toggleMusicMute}
              isSoundEffectsMuted={isSoundEffectsMuted}
              toggleSoundEffectsMute={toggleSoundEffectsMute}
              audioRef={audioRef}
            />
          )}
          {gameStarted && !isGameOver && !showQuitConfirmation && (
            <div className="buttons">
              <button onClick={togglePause}>{isPaused ? 'Resume' : 'Pause'}</button>
              <button onClick={quitGame}>Quit</button>
            </div>
          )}
        </div>
        <div className="game-info">
          {gameStarted && (
            <>
              <div className="score-board">
                <div>Level: {level}</div>
                <div>Lines: {lines}</div>
                <div>Score: {score}</div>
              </div>
              <div className="next-piece">
                <h3>Next Piece</h3>
                {nextPiece && (
                  <div className="next-piece-container">
                    <Piece type={nextPiece} cellSize={15} isNextPiece={true} />
                  </div>
                )}
              </div>
              <div className="controls">
                <h3>Controls</h3>
                <div className="controls-container">
                  <div><strong>Move Left:</strong> Left Arrow</div>
                  <div><strong>Move Right:</strong> Right Arrow</div>
                  <div><strong>Move Piece Down:</strong> Down Arrow</div>
                  <div><strong>Rotate:</strong> Up Arrow</div>
                  <div><strong>Hard Drop:</strong> Spacebar</div>
                </div>
              </div>
            </>
          )}
          {!gameStarted && (
            <>
              <div className="level-selector">
                <button
                  className={`arrow-button ${selectedLevel === 1 ? 'disabled' : ''}`}
                  onClick={() => handleLevelChange(-1)}
                  disabled={selectedLevel === 1}
                >
                  &lt;
                </button>
                <div>Level: {selectedLevel}</div>
                <button
                  className={`arrow-button ${selectedLevel === 10 ? 'disabled' : ''}`}
                  onClick={() => handleLevelChange(1)}
                  disabled={selectedLevel === 10}
                >
                  &gt;
                </button>
              </div>
              <div className="home-buttons">
                <button onClick={startGame}>Start</button>
                <button onClick={toggleMusicMute} className="mute-music-button">
                  <span className="icon-container">
                    <FontAwesomeIcon icon={faMusic} />
                    {isMusicMuted && <FontAwesomeIcon icon={faSlash} className="overlay-icon" />}
                  </span>
                </button>
                <button onClick={toggleSoundEffectsMute} className="mute-sound-button">
                  <FontAwesomeIcon icon={isSoundEffectsMuted ? faVolumeMute : faVolumeUp} />
                </button>
              </div>
              <Scoreboard scores={scores} />
            </>
          )}
        </div>
      </div>
      {showScoreInputModal && (
        <ScoreInputModal 
          isOpen={showScoreInputModal} 
          onSubmit={handleScoreSubmit} 
          onCancel={handleScoreCancel} 
        />
      )}
    </div>
  );
}

export default App;