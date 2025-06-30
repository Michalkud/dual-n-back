import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mode } from '@dual-n-back/shared';
import { useGameStore } from '../store/gameStore';
import GameBoard from '../components/GameBoard';

const Game: React.FC = () => {
  const {
    connect,
    disconnect,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    isConnected,
    session,
    isLoading,
    error,
    clearError,
    nLevel,
    mode
  } = useGameStore();

  const [selectedNLevel, setSelectedNLevel] = useState(nLevel);
  const [selectedMode, setSelectedMode] = useState(mode);

  // Connect to WebSocket on component mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const handleStartGame = () => {
    if (!isConnected) {
      connect();
      return;
    }

    startGame({
      mode: selectedMode,
      nLevel: selectedNLevel
    });
  };

  const handlePauseResume = () => {
    if (session?.isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };

  const handleEndGame = () => {
    if (window.confirm('Are you sure you want to end the current game?')) {
      endGame();
    }
  };

  const canStartGame = isConnected && !session?.isActive;
  const canPauseResume = session?.isActive;
  const canEndGame = session?.isActive;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dual N-Back Training</h1>
          <p className="text-gray-600">Challenge your working memory with visual and audio stimuli</p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-6">
          <div className={`
            flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium
            ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          `}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Game Configuration */}
        {canStartGame && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Game Settings</h2>
            
            <div className="space-y-4">
              {/* N-Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N-Level: {selectedNLevel}
                </label>
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={selectedNLevel}
                  onChange={(e) => setSelectedNLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 (Easy)</span>
                  <span>9 (Expert)</span>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Mode
                </label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value as Mode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={Mode.DUAL}>Dual (Visual + Audio)</option>
                  <option value={Mode.QUAD} disabled>Quad (Coming Soon)</option>
                  <option value={Mode.PENTA} disabled>Penta (Coming Soon)</option>
                </select>
              </div>

              {/* Start Button */}
              <motion.button
                onClick={handleStartGame}
                disabled={isLoading || !isConnected}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold text-white
                  ${isLoading || !isConnected 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  }
                  transition-colors duration-200
                `}
                whileHover={isLoading || !isConnected ? {} : { scale: 1.02 }}
                whileTap={isLoading || !isConnected ? {} : { scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting...</span>
                  </div>
                ) : !isConnected ? (
                  'Connect to Server'
                ) : (
                  'Start Game'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Game Controls */}
        {session && (
          <div className="flex justify-center space-x-4 mb-8">
            {canPauseResume && (
              <motion.button
                onClick={handlePauseResume}
                className={`
                  px-6 py-2 rounded-lg font-medium
                  ${session.isPaused 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }
                  transition-colors duration-200
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {session.isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </motion.button>
            )}

            {canEndGame && (
              <motion.button
                onClick={handleEndGame}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🛑 End Game
              </motion.button>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
          >
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={clearError}
                className="text-red-500 hover:text-red-700 ml-4"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Game Board */}
        <GameBoard />

        {/* Instructions */}
        {!session && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto mt-12 bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Play</h3>
            <div className="space-y-3 text-gray-600">
              <p>
                The <strong>Dual N-Back</strong> test challenges your working memory by presenting 
                two types of stimuli simultaneously:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">🎯 Visual Stream</h4>
                  <p className="text-sm">
                    A blue square appears in one of 9 positions on the grid. 
                    Press <kbd className="px-1 py-0.5 bg-white rounded text-blue-800 font-mono">A</kbd> when 
                    the current position matches the position from N trials back.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🔊 Audio Stream</h4>
                  <p className="text-sm">
                    You'll hear a consonant letter. 
                    Press <kbd className="px-1 py-0.5 bg-white rounded text-green-800 font-mono">L</kbd> when 
                    the current letter matches the letter from N trials back.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-yellow-800 mb-2">🧠 The Challenge</h4>
                <p className="text-sm">
                  Both streams run simultaneously and independently. You need to track both 
                  sequences in your working memory and respond to matches in either stream.
                  Start with N=2 and work your way up!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Game; 