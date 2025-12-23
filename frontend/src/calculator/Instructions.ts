const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'] as const;
export type Digit = typeof DIGITS[number];

const UNARY_OPS = ['s', '='] as const;
export type UnaryOp = typeof UNARY_OPS[number];

const BINARY_OPS = ['+', '-', '*', '/', '^', '%'] as const;
export type BinaryOp = typeof BINARY_OPS[number];

const OPERATORS = [...UNARY_OPS, ...BINARY_OPS] as const;
export type Operator = typeof OPERATORS[number];

const INSTRUCTIONS = [...DIGITS, ...OPERATORS, 'c', 'd', 't'] as const;
export type Instruction = typeof INSTRUCTIONS[number];

export function isInstruction(s: string): s is Instruction {
  return (s.length === 1) && INSTRUCTIONS.includes(s as Instruction);
}

export function isDigit(i: Instruction): i is Digit {
  return (i.length === 1) && DIGITS.includes(i as Digit);
}

export function isOperator(i: Instruction): i is Operator {
  return (OPERATORS as readonly string[]).includes(i);
}

export function isUnaryOp(i: Instruction): i is UnaryOp {
  return (UNARY_OPS as readonly string[]).includes(i);
}

export function isBinaryOp(i: Instruction): i is BinaryOp {
  return (BINARY_OPS as readonly string[]).includes(i);
}

export type CalcNumber = string;

export function appendDigit(n: CalcNumber, d: Digit): CalcNumber {
  if (d === '.') {
    if (n.includes('.')) return n;
    if (n.length === 0) {
      n += '0';
    }
  } else if (d === '0') {
    if (n.length === 0 || n === '0') return '0';
  }
  return n + d;
}

export function toggleSign(n: CalcNumber): CalcNumber {
  if (n.length === 0) return n;
  if (n.startsWith('-')) return n.slice(1);
  return '-' + n;
}

export function safeToString(n: CalcNumber): CalcNumber {
  return n.length === 0 ? '0' : n;
}
