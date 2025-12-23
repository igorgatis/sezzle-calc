const API_BASE = '/api';

interface BinaryRequest {
  a: string;
  b: string;
}

interface UnaryRequest {
  a: string;
}

interface CalculatorResponse {
  result?: string;
  error?: string;
}

async function post<T>(endpoint: string, body: T): Promise<string> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json() as CalculatorResponse;
  if (data.error) {
    throw new Error(data.error);
  }
  if (data.result !== undefined && data.result !== null) {
    return `${data.result}`;
  }
  throw new Error("Result is empty");
}

export async function add(a: string, b: string): Promise<string> {
  return post<BinaryRequest>('/add', { a, b });
}

export async function subtract(a: string, b: string): Promise<string> {
  return post<BinaryRequest>('/subtract', { a, b });
}

export async function multiply(a: string, b: string): Promise<string> {
  return post<BinaryRequest>('/multiply', { a, b });
}

export async function divide(a: string, b: string): Promise<string> {
  return post<BinaryRequest>('/divide', { a, b });
}

export async function power(a: string, b: string): Promise<string> {
  return post<BinaryRequest>('/power', { a, b });
}

export async function sqrt(a: string): Promise<string> {
  return post<UnaryRequest>('/sqrt', { a });
}

export async function percentage(a: string, b: string): Promise<string> {
  return post<BinaryRequest>('/percentage', { a, b });
}
