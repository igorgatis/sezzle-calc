import React, { useRef, useState, useEffect } from 'react';
import { CalculatorState, CalculatorSnapshot } from '../calculator/CalculatorState';
import { isInstruction } from '../calculator/Instructions';

const numBtnClass = `
  bg-gray-600 hover:bg-gray-500 active:bg-gray-400
  text-white text-2xl font-medium
  rounded-full h-16 w-full
  transition-colors duration-100
`;

const opBtnClass = `
  bg-orange-500 hover:bg-orange-400 active:bg-orange-300
  text-white text-2xl font-medium
  rounded-full h-16 w-full
  transition-colors duration-100
`;

const clearBtnClass = `
  bg-gray-400 hover:bg-gray-300 active:bg-gray-200
  text-black text-2xl font-medium
  rounded-full h-16 w-full
  transition-colors duration-100
`;

function Calculator() {
  const calcRef = useRef<CalculatorState | null>(null);
  if (!calcRef.current) {
    calcRef.current = new CalculatorState();
  }
  const calc = calcRef.current;

  const [, setSnapshot] = useState<CalculatorSnapshot>(calc.snapshot());

  useEffect(() => {
    calc.setListener((s) => setSnapshot(s));
    return () => calc.setListener(null);
  }, [calc]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Backspace': calc.handle('d'); break;
        case 'Escape': calc.handle('c'); break;
        case 'Enter': calc.handle('='); break;
        default:
          if (isInstruction(e.key)) {
            // '/' triggers browser's "Quick Find" feature
            if (e.key === '/') e.preventDefault();
            calc.handle(e.key);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calc]);

  const entryText = calc.getEntry();
  const getEntryTextSize = (text: string) => {
    const len = text.length;
    if (len <= 8) return 'text-4xl';
    if (len <= 12) return 'text-3xl';
    if (len <= 16) return 'text-2xl';
    return 'text-xl';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="bg-neutral-800 rounded-2xl p-4 mb-4 min-h-[100px] flex flex-col justify-end">
          <div className="text-gray-400 text-right text-lg font-mono h-6 overflow-hidden">
            {calc.getMemory()}
          </div>
          <div
            className={`text-white text-right font-mono mt-2 break-all ${getEntryTextSize(entryText)}`}
            data-testid="display">
            {entryText}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <button className={opBtnClass} onClick={() => calc.handle('s')}>&#x221A;x</button>
          <button className={opBtnClass} onClick={() => calc.handle('^')}>x<sup>y</sup></button>
          <button className={`${opBtnClass} col-span-2`} onClick={() => calc.handle('%')}>x% of y</button>

          <button className={numBtnClass} onClick={() => calc.handle('7')}>7</button>
          <button className={numBtnClass} onClick={() => calc.handle('8')}>8</button>
          <button className={numBtnClass} onClick={() => calc.handle('9')}>9</button>
          <button className={opBtnClass} onClick={() => calc.handle('/')}>/</button>

          <button className={numBtnClass} onClick={() => calc.handle('4')}>4</button>
          <button className={numBtnClass} onClick={() => calc.handle('5')}>5</button>
          <button className={numBtnClass} onClick={() => calc.handle('6')}>6</button>
          <button className={opBtnClass} onClick={() => calc.handle('*')}>*</button>

          <button className={numBtnClass} onClick={() => calc.handle('1')}>1</button>
          <button className={numBtnClass} onClick={() => calc.handle('2')}>2</button>
          <button className={numBtnClass} onClick={() => calc.handle('3')}>3</button>
          <button className={opBtnClass} onClick={() => calc.handle('-')}>-</button>

          <button className={numBtnClass} onClick={() => calc.handle('0')}>0</button>
          <button className={numBtnClass} onClick={() => calc.handle('.')}>.</button>
          <button className={numBtnClass} onClick={() => calc.handle('t')}>+/-</button>
          <button className={opBtnClass} onClick={() => calc.handle('+')}>+</button>

          <button className={clearBtnClass} onClick={() => calc.handle('c')}>C</button>
          <button className={clearBtnClass} onClick={() => calc.handle('d')}>DEL</button>
          <button className={`${opBtnClass} col-span-2`} onClick={() => calc.handle('=')}>=</button>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
