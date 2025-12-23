import * as api from '../api/calculator';

const DIGITS = '0123456789.';
const OPERATORS = '+-*/^%scdt=';
const INSTRUCTIONS = DIGITS + OPERATORS;

export function isInstruction(inst: string): boolean {
  return inst.length === 1 && INSTRUCTIONS.includes(inst);
}

export interface CalculatorSnapshot {
  display: string;
  operand: string | null;
  operator: string | null;
  resetDisplay: boolean;
  error: string | null;
}

export type StateChangeListener = (state: CalculatorSnapshot) => void;

export class CalculatorState {
  private display: string = "0";
  private operand: string | null = null;
  private operator: string | null = null;
  private resetDisplay: boolean = false;
  private error: string | null = null;

  private listener: StateChangeListener | null = null;

  setListener(listener: StateChangeListener | null): void {
    this.listener = listener;
  }

  private notify(): void {
    this.listener?.(this.snapshot());
    console.log(this.snapshot());
  }

  snapshot(): CalculatorSnapshot {
    return {
      display: this.display,
      operand: this.operand,
      operator: this.operator,
      resetDisplay: this.resetDisplay,
      error: this.error,
    };
  }

  private clear(): void {
    this.display = "0";
    this.operand = null;
    this.operator = null;
    this.resetDisplay = false;
    this.error = null;
  }

  async handleSequence(sequence: string): Promise<void> {
    for (const char of sequence) {
      await this.handle(char);
    }
  }

  async handle(inst: string): Promise<void> {
    if (!isInstruction(inst)) {
      throw Error(`Invalid instruction: ${inst}`)
    }

    if (this.error && inst !== "c") {
       // Error state logic handled in specific methods or reset by them
       this.clear();
    }

    if (/[0-9]/.test(inst)) {
      this.handleDigit(inst);
    } else if (inst === ".") {
      this.handleDot();
    } else if (inst === "c") {
      this.handleClear();
    } else if (inst === "d") {
      this.handleDelete();
    } else if (inst === "s") {
      this.handleSqrt();
    } else if (inst === "t") {
      this.handleToggleSign();
    } else if (["+", "-", "*", "/", "%", "^"].includes(inst)) {
      await this.handleOperator(inst);
    } else if (inst === "=") {
      await this.handleEqual();
    }
    this.notify();
  }

  getDisplay(): string {
    if (this.error) {
        return this.error;
    }
    return this.display;
  }

  getExpression(): string {
    if (this.operand !== null && this.operator !== null) {
      return `${this.operand} ${this.operator}`;
    }
    return '';
  }

  private handleDigit(digit: string): void {
    if (this.error) {
        this.error = null;
        this.display = digit;
        this.resetDisplay = false;
        this.operand = null;
        this.operator = null;
        return;
    }

    if (this.resetDisplay) {
      this.display = digit;
      this.resetDisplay = false;
    } else {
      if (this.display === "0") {
        this.display = digit;
      } else {
        this.display += digit;
      }
    }
  }

  private handleDot(): void {
    if (this.error) {
        this.error = null;
        this.display = "0.";
        this.resetDisplay = false;
        this.operand = null;
        this.operator = null;
        return;
    }

    if (this.resetDisplay) {
      this.display = "0.";
      this.resetDisplay = false;
    } else {
      if (!this.display.includes(".")) {
        this.display += ".";
      }
    }
  }

  private handleClear(): void {
    this.display = "0";
    this.operand = null;
    this.operator = null;
    this.resetDisplay = false;
    this.error = null;
  }

  private handleDelete(): void {
    if (this.error) return; 

    if (this.resetDisplay) {
        return;
    }

    if (this.display.length > 1) {
      this.display = this.display.slice(0, -1);
    } else {
      this.display = "0";
    }
  }

  private handleSqrt(): void {
    if (this.error) return;

    const val = parseFloat(this.display);
    if (val < 0) {
        this.error = "Error";
        this.resetDisplay = true;
    } else {
        this.display = Math.sqrt(val).toString();
        this.resetDisplay = true; 
    }
  }

  private handleToggleSign(): void {
    if (this.error) return;

    const val = parseFloat(this.display);
    this.display = (-val).toString();
  }

  private async handleOperator(op: string): Promise<void> {
    if (this.error) return;

    if (this.operator !== null && !this.resetDisplay) {
        await this.calculate();
        if (this.error) return;
    }
    
    this.operand = this.display;
    this.operator = op;
    this.resetDisplay = true;
  }

  private async handleEqual(): Promise<void> {
    if (this.error) return;

    if (this.operator !== null && this.operand !== null) {
        await this.calculate();
        // If calculation caused error, it's set in calculate
        if (!this.error) {
            this.operator = null;
            this.operand = null;
            this.resetDisplay = true;
        }
    }
  }

  private async calculate(): Promise<void> {
    const a = this.operand!;
    const b = this.display;
    let res = '0';
    try {
      switch (this.operator) {
        case '+': res = await api.add(a, b); break;
        case '-': res = await api.subtract(a, b); break;
        case '*': res = await api.multiply(a, b); break;
        case '/': res = await api.divide(a, b); break;
        case '^': res = await api.power(a, b); break;
        case '%': res = await api.percentage(a, b); break;
        case 's': res = await api.sqrt(a); break;
        default:
          throw new Error(`Failed to process ${this.operator}`);
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : "API Error";;
    } 
    this.display = res;
  }
}
