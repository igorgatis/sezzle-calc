import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calculator from './Calculator';
import * as api from '../api/calculator';

jest.mock('../api/calculator');

const mockApi = api as jest.Mocked<typeof api>;

describe('Calculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders calculator with display showing 0', () => {
    render(<Calculator />);
    expect(screen.getByTestId('display')).toHaveTextContent('0');
  });

  it('displays digits when number buttons are clicked', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    expect(screen.getByTestId('display')).toHaveTextContent('0123');
  });

  it('handles decimal input', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('.'));
    fireEvent.click(screen.getByText('5'));
    expect(screen.getByTestId('display')).toHaveTextContent('01.5');
  });

  it('prevents multiple decimal points', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('.'));
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('.'));
    fireEvent.click(screen.getByText('2'));
    expect(screen.getByTestId('display')).toHaveTextContent('01.52');
  });

  it('clears display when C is clicked', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('C'));
    expect(screen.getByTestId('display')).toHaveTextContent('0');
  });

  it('performs addition via API', async () => {
    mockApi.add.mockResolvedValue("8");

    render(<Calculator />);
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('8');
    });
    expect(mockApi.add).toHaveBeenCalledWith('05', '3');
  });

  it('performs subtraction via API', async () => {
    mockApi.subtract.mockResolvedValue("7");

    render(<Calculator />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('0'));
    fireEvent.click(screen.getByText('-'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('7');
    });
    expect(mockApi.subtract).toHaveBeenCalledWith('010', '3');
  });

  it('performs multiplication via API', async () => {
    mockApi.multiply.mockResolvedValue("15");

    render(<Calculator />);
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('*'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('15');
    });
    expect(mockApi.multiply).toHaveBeenCalledWith('05', '3');
  });

  it('performs division via API', async () => {
    mockApi.divide.mockResolvedValue("5");

    render(<Calculator />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('0'));
    fireEvent.click(screen.getByText('/'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('='));

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('5');
    });
    expect(mockApi.divide).toHaveBeenCalledWith('010', '2');
  });

  it('performs sqrt via API', async () => {
    mockApi.sqrt.mockResolvedValue("4");

    render(<Calculator />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('6'));

    const sqrtButton = screen.getByRole('button', { name: /√x/i });
    fireEvent.click(sqrtButton);
    fireEvent.click(screen.getByText('='));

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('4');
    });
    expect(mockApi.sqrt).toHaveBeenCalledWith('016');
  });

  it('displays error from API', async () => {
    mockApi.divide.mockRejectedValue(new Error('division by zero'));

    render(<Calculator />);
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('/'));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByText('='));

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('API Error');
    });
  });

  it('performs power operation via API', async () => {
    mockApi.power.mockResolvedValue("8");

    render(<Calculator />);
    fireEvent.click(screen.getByText('2'));
    const powerButton = screen.getByRole('button', { name: /x y/i });
    fireEvent.click(powerButton);
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('8');
    });
    expect(mockApi.power).toHaveBeenCalledWith('02', '3');
  });

  it('performs percentage operation via API', async () => {
    mockApi.percentage.mockResolvedValue("100");

    render(<Calculator />);
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('0'));
    fireEvent.click(screen.getByText('x% of y'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByText('='));

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('100');
    });
    expect(mockApi.percentage).toHaveBeenCalledWith('050', '200');
  });

  it('toggles sign with +/- button', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('+/-'));
    expect(screen.getByTestId('display')).toHaveTextContent('-05');
    fireEvent.click(screen.getByText('+/-'));
    expect(screen.getByTestId('display')).toHaveTextContent('05');
  });

  it('deletes last digit with DEL button', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('DEL'));
    expect(screen.getByTestId('display')).toHaveTextContent('012');
  });

  it('resets to 0 when deleting last digit', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('DEL'));
    fireEvent.click(screen.getByText('DEL'));
    expect(screen.getByTestId('display')).toHaveTextContent('0');
  });
});
