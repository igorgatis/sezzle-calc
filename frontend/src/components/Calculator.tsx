"use client";

import React, { useRef, useState, useEffect } from "react";
import { CalculatorState, CalculatorSnapshot, isInstruction } from "@/lib/calculator-state";

const numBtnBase = `
  text-white text-2xl md:text-3xl font-medium
  rounded-full h-16 md:h-20 lg:h-24 w-full
  transition-colors duration-100
`;

const numBtnEnabled = `bg-gray-600 hover:bg-gray-500 active:bg-gray-400`;
const numBtnDisabled = `bg-gray-700 opacity-50 cursor-not-allowed`;

const opBtnBase = `
  text-white text-2xl md:text-3xl font-medium
  rounded-full h-16 md:h-20 lg:h-24 w-full
  transition-colors duration-100
`;

const opBtnEnabled = `bg-orange-500 hover:bg-orange-400 active:bg-orange-300`;
const opBtnDisabled = `bg-orange-700 opacity-50 cursor-not-allowed`;

const clearBtnBase = `
  text-black text-2xl md:text-3xl font-medium
  rounded-full h-16 md:h-20 lg:h-24 w-full
  transition-colors duration-100
`;

const clearBtnEnabled = `bg-gray-400 hover:bg-gray-300 active:bg-gray-200`;
const clearBtnDisabled = `bg-gray-500 opacity-50 cursor-not-allowed`;

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
      if (calc.isProcessing()) return;
      switch (e.key) {
        case "Backspace":
          calc.handle("d");
          break;
        case "Escape":
          calc.handle("c");
          break;
        case "Enter":
          calc.handle("=");
          break;
        default:
          if (isInstruction(e.key)) {
            if (e.key === "/") e.preventDefault();
            calc.handle(e.key);
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [calc]);

  const processing = calc.isProcessing();
  const expression = calc.getExpression();
  const displayText = processing ? "processing..." : calc.getDisplay();

  const numBtnClass = `${numBtnBase} ${processing ? numBtnDisabled : numBtnEnabled}`;
  const opBtnClass = `${opBtnBase} ${processing ? opBtnDisabled : opBtnEnabled}`;
  const clearBtnClass = `${clearBtnBase} ${processing ? clearBtnDisabled : clearBtnEnabled}`;

  const getTextSize = (text: string) => {
    const len = text.length;
    if (len <= 13) return "text-3xl md:text-4xl lg:text-5xl";
    if (len <= 18) return "text-2xl md:text-3xl lg:text-4xl";
    if (len <= 22) return "text-xl md:text-2xl lg:text-3xl";
    if (len <= 27) return "text-lg md:text-xl lg:text-2xl";
    if (len <= 33) return "text-base md:text-lg lg:text-xl";
    return "text-sm md:text-base lg:text-lg";
  };

  return (
    <div className="min-h-screen min-w-[320px] bg-black flex items-center justify-center p-2">
      <div
        className="bg-neutral-900 rounded-3xl p-4 md:p-6 lg:p-8 w-full
        max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl shadow-2xl"
      >
        <div
          className="bg-neutral-800 rounded-2xl p-4 md:p-6 mb-4 md:mb-6
          min-h-[100px] md:min-h-[120px] lg:min-h-[140px] flex flex-col justify-end"
        >
          <div
            className={`text-gray-400 text-right font-mono break-all
            h-7 md:h-8 lg:h-10 ${getTextSize(expression)}`}
          >
            {expression}
          </div>
          <div
            className={`text-white text-right font-mono mt-2 md:mt-3 break-all
              ${getTextSize(displayText)}`}
            data-testid="display"
          >
            {displayText}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 md:gap-4">
          <button className={opBtnClass} onClick={() => calc.handle("s")} disabled={processing}>
            &#x221A;x
          </button>
          <button className={opBtnClass} onClick={() => calc.handle("^")} disabled={processing}>
            x<sup>y</sup>
          </button>
          <button className={`${opBtnClass} col-span-2`} onClick={() => calc.handle("%")} disabled={processing}>
            x% of y
          </button>

          <button className={numBtnClass} onClick={() => calc.handle("7")} disabled={processing}>
            7
          </button>
          <button className={numBtnClass} onClick={() => calc.handle("8")} disabled={processing}>
            8
          </button>
          <button className={numBtnClass} onClick={() => calc.handle("9")} disabled={processing}>
            9
          </button>
          <button className={opBtnClass} onClick={() => calc.handle("/")} disabled={processing}>
            /
          </button>

          <button className={numBtnClass} onClick={() => calc.handle("4")} disabled={processing}>
            4
          </button>
          <button className={numBtnClass} onClick={() => calc.handle("5")} disabled={processing}>
            5
          </button>
          <button className={numBtnClass} onClick={() => calc.handle("6")} disabled={processing}>
            6
          </button>
          <button className={opBtnClass} onClick={() => calc.handle("*")} disabled={processing}>
            *
          </button>

          <button className={numBtnClass} onClick={() => calc.handle("1")} disabled={processing}>
            1
          </button>
          <button className={numBtnClass} onClick={() => calc.handle("2")} disabled={processing}>
            2
          </button>
          <button className={numBtnClass} onClick={() => calc.handle("3")} disabled={processing}>
            3
          </button>
          <button className={opBtnClass} onClick={() => calc.handle("-")} disabled={processing}>
            -
          </button>

          <button className={numBtnClass} onClick={() => calc.handle("0")} disabled={processing}>
            0
          </button>
          <button className={numBtnClass} onClick={() => calc.handle(".")} disabled={processing}>
            .
          </button>
          <button className={numBtnClass} onClick={() => calc.handle("t")} disabled={processing}>
            &#x00B1;
          </button>
          <button className={opBtnClass} onClick={() => calc.handle("+")} disabled={processing}>
            +
          </button>

          <button className={clearBtnClass} onClick={() => calc.handle("c")} disabled={processing}>
            C
          </button>
          <button className={clearBtnClass} onClick={() => calc.handle("d")} disabled={processing}>
            DEL
          </button>
          <button className={`${opBtnClass} col-span-2`} onClick={() => calc.handle("=")} disabled={processing}>
            =
          </button>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
