import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreamType } from '@dual-n-back/shared';
import { useGameStore } from '../store/gameStore';
import { audioService } from '../services/audioService';

const GameBoard: React.FC = () => {
  const {
    session,
    currentStimulus,
    gridHighlight,
    isPlayingAudio,
    currentAudioLetter,
    accuracy,
    feedbackMessage,
    error,
    isConnected,
    submitResponse
  } = useGameStore();

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!session?.isActive || session.isPaused) return;

    const key = event.key.toUpperCase();
    
    if (key === 'A') {
      // Visual position match response
      submitResponse(StreamType.POSITION, true);
    } else if (key === 'L') {
      // Audio letter match response  
      submitResponse(StreamType.LETTER, true);
    }
  }, [session, submitResponse]);

  // Set up keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Play audio when new stimulus arrives
  useEffect(() => {
    if (currentStimulus && currentAudioLetter) {
      audioService.playLetter(currentAudioLetter);
    }
  }, [currentStimulus, currentAudioLetter]);

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = () => {
      audioService.ensureInitialized();
    };

    if (session?.isActive) {
      document.addEventListener('click', initAudio, { once: true });
      document.addEventListener('keydown', initAudio, { once: true });
    }

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, [session?.isActive]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-xl text-red-500 mb-2">Disconnected from server</div>
          <div className="text-sm text-gray-500">Please check your connection</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">Ready to play</div>
          <div className="text-sm">Start a game to begin</div>
        </div>
      </div>
    );
  }

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < 9; i++) {
      const isHighlighted = gridHighlight === i;
      
      cells.push(
        <motion.div
          key={i}
          className={`
            aspect-square border-2 border-gray-300 rounded-lg
            flex items-center justify-center font-bold text-sm
            ${isHighlighted ? 'bg-blue-500 border-blue-600' : 'bg-gray-100'}
            transition-colors duration-150
          `}
          initial={false}
          animate={{
            backgroundColor: isHighlighted ? '#3B82F6' : '#F3F4F6',
            borderColor: isHighlighted ? '#2563EB' : '#D1D5DB',
            scale: isHighlighted ? 1.05 : 1
          }}
          transition={{ duration: 0.15 }}
        >
          {i}
        </motion.div>
      );
    }
    return cells;
  };

  const getProgressPercentage = () => {
    return session ? (session.currentTrial / session.totalTrials) * 100 : 0;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Game Status */}
      <div className="text-center space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            N-Level: <span className="font-bold text-blue-600">{session.nLevel}</span>
          </div>
          <div className="text-sm text-gray-600">
            Trial: <span className="font-bold">{session.currentTrial}</span> / {session.totalTrials}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 3x3 Visual Grid */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          {renderGrid()}
        </div>
      </div>

      {/* Audio Indicator */}
      <div className="flex justify-center">
        <motion.div 
          className={`
            px-6 py-3 rounded-lg text-center
            ${isPlayingAudio ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}
          `}
          animate={{
            scale: isPlayingAudio ? [1, 1.1, 1] : 1,
            backgroundColor: isPlayingAudio ? '#10B981' : '#F3F4F6'
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-sm font-medium">
            {isPlayingAudio ? `🔊 ${currentAudioLetter}` : '🔇 Audio'}
          </div>
        </motion.div>
      </div>

      {/* Accuracy Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {(accuracy.visual * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Visual</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {(accuracy.audio * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Audio</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {(accuracy.combined * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Combined</div>
          </div>
        </div>
      </div>

      {/* Controls Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="text-center space-y-2">
          <div className="text-sm font-medium text-blue-800">Controls</div>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="flex items-center justify-center space-x-2">
              <kbd className="px-2 py-1 bg-white rounded text-blue-800 font-mono">A</kbd>
              <span>Visual match</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <kbd className="px-2 py-1 bg-white rounded text-blue-800 font-mono">L</kbd>
              <span>Audio match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-3 bg-yellow-100 text-yellow-800 rounded-lg"
          >
            {feedbackMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-3 bg-red-100 text-red-800 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Status Indicators */}
      {session.isPaused && (
        <div className="text-center p-4 bg-orange-100 text-orange-800 rounded-lg">
          <div className="text-lg font-medium">⏸️ Game Paused</div>
          <div className="text-sm">Press resume to continue</div>
        </div>
      )}
    </div>
  );
};

export default GameBoard; 