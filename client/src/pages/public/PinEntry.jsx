// src/pages/public/PinEntry.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaBackspace } from 'react-icons/fa';

const PinEntry = ({ onComplete, length = 6, disabled = false }) => {
  const [pin, setPin] = useState('');
  const [focusIndex, setFocusIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (pin.length === length) {
      onComplete(pin);
    }
  }, [pin, length, onComplete]);

  const handleNumberClick = (number) => {
    if (pin.length < length && !disabled) {
      const newPin = pin + number;
      setPin(newPin);
      setFocusIndex(pin.length + 1);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0 && !disabled) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      setFocusIndex(newPin.length);
    }
  };

  const handleClear = () => {
    if (!disabled) {
      setPin('');
      setFocusIndex(0);
    }
  };

  const renderPinDisplay = () => {
    return (
      <div className="flex justify-center space-x-2 mb-6">
        {Array.from({ length }, (_, index) => (
          <div
            key={index}
            className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center text-xl font-bold
              ${index < pin.length 
                ? 'border-primary bg-primary text-primary-content' 
                : index === focusIndex 
                  ? 'border-primary border-dashed' 
                  : 'border-gray-300'
              }`}
          >
            {index < pin.length ? '●' : ''}
          </div>
        ))}
      </div>
    );
  };

  const numberPad = [
    [1, 2, 3],
    [4, 5, 6], 
    [7, 8, 9],
    ['clear', 0, 'backspace']
  ];

  return (
    <div className="w-full max-w-xs mx-auto">
      {renderPinDisplay()}
      
      <div className="grid grid-cols-3 gap-3">
        {numberPad.flat().map((item, index) => {
          if (item === 'clear') {
            return (
              <button
                key={index}
                className="btn btn-outline btn-error h-12"
                onClick={handleClear}
                disabled={disabled || pin.length === 0}
              >
                C
              </button>
            );
          } else if (item === 'backspace') {
            return (
              <button
                key={index}
                className="btn btn-outline h-12"
                onClick={handleBackspace}
                disabled={disabled || pin.length === 0}
              >
                <FaBackspace />
              </button>
            );
          } else {
            return (
              <button
                key={index}
                className="btn btn-primary h-12 text-xl font-bold"
                onClick={() => handleNumberClick(item.toString())}
                disabled={disabled || pin.length >= length}
              >
                {item}
              </button>
            );
          }
        })}
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Enter your {length}-digit PIN
        </p>
        {disabled && (
          <p className="text-xs text-orange-600 mt-1">
            Please wait...
          </p>
        )}
      </div>
    </div>
  );
};

export default PinEntry;
