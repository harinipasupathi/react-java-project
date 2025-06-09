import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders Shell Command label', () => {
  render(<App />);
  const labelElement = screen.getByText(/shell command/i);
  expect(labelElement).toBeInTheDocument();
});

test('renders Create Task button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/create task/i);
  expect(buttonElement).toBeInTheDocument();
});
