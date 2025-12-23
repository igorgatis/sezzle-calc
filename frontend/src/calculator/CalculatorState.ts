import * as api from '../api/calculator';
import { Digit, Operator, Instruction, CalcNumber, appendDigit, toggleSign, isUnaryOp, isDigit, isOperator, safeToString } from './Instructions';

export interface CalculatorSnapshot {
  a: string;
  b: string;
  op: Operator;
  err: string | null;
  clearA: boolean;
}

export type StateChangeListener = (state: CalculatorSnapshot) => void;

export class CalculatorState {
  private a: CalcNumber = '';
  private b: CalcNumber = '';
  private op: Operator = '=';
  private err: string | null = null;
  private clearA: boolean = false;

  private listener: StateChangeListener | null = null;

  setListener(listener: StateChangeListener | null): void {
    this.listener = listener;
  }

  private notify(): void {
    this.listener?.(this.snapshot());
  }

  private clear(): void {
    this.a = '';
    this.b = '';
    this.op = '=';
    this.err = null;
    this.clearA = false;
  }

  snapshot(): CalculatorSnapshot {
    return {
      a: this.a,
      b: this.b,
      op: this.op,
      err: this.err,
      clearA: this.clearA,
    };
  }

  getMemory(): string {
    if (this.err !== null || isUnaryOp(this.op)) return '';
    if (this.a.startsWith('-')) {
      return `(${safeToString(this.a)})${this.op}`;
    }
    return `${safeToString(this.a)}${this.op}`;
  }

  getEntry(): string {
    if (isUnaryOp(this.op)) {
      return safeToString(this.a);
    } else {
      return safeToString(this.b);
    }
  }

  async handle(inst: Instruction): Promise<boolean> {
    const handled = await this.handleInternal(inst);
    console.log(this.snapshot(), {inst});
    this.notify();
    return handled;
  }

  private async handleInternal(inst: Instruction): Promise<boolean> {
    if (inst === 'c') {
      this.clear();
      return true;
    }

    if (this.err) return false;

    switch (inst) {
      case 'd': this.delete(); break;
      case 't': this.toggleSign(); break;
      default:
        if (isOperator(inst)) {
          await this.handleOperator(inst);
        } else if (isDigit(inst)) {
          this.handleDigit(inst);
        } else {
          throw new Error(`Failed to process ${inst}`);
        }
    }
    return true;
  }
  
  private handleDigit(digit: Digit): void {
    if (isUnaryOp(this.op)) {
      if (this.clearA) {
        this.clearA = false;
        this.a = '';
      }
      this.a = appendDigit(this.a, digit);
    } else {
      this.b = appendDigit(this.b, digit);
    }
  }

  private toggleSign(): void {
    if (isUnaryOp(this.op)) {
      this.a = toggleSign(this.a);
    } else {
      this.b = toggleSign(this.b);
    }
  }

  private delete(): void {
    if (isUnaryOp(this.op)) {
      if (this.a.length > 0) {
        this.a = this.a.slice(0, -1);
      }
    } else {
      if (this.b.length > 0) {
        this.b = this.b.slice(0, -1);
      } else {
        this.op = '=';
      }
    }
  }

  private async handleOperator(nextOp: Operator): Promise<void> {
    if (this.op !== '=' && this.a.length > 0) {
      if (isUnaryOp(this.op) || this.b.length > 0) {
        await this.calculate();
      }
    }
    this.op = nextOp;
  }

  private async calculate(): Promise<void> {
    try {
      const a = safeToString(this.a);
      const b = safeToString(this.b);
      let res  = '';
      switch (this.op) {
        case '+': res = await api.add(a, b); break;
        case '-': res = await api.subtract(a, b); break;
        case '*': res = await api.multiply(a, b); break;
        case '/': res = await api.divide(a, b); break;
        case '^': res = await api.power(a, b); break;
        case '%': res = await api.percentage(a, b); break;
        case 's': res = await api.sqrt(a); break;
        case '=': break;
        default:
          throw new Error(`Failed to process ${this.op}`);
      }
      this.clear();
      this.a = res;
      this.clearA = true;
    } catch (err) {
      console.log(err);
      this.err = "API Error";
    }
  }
}
