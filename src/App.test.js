import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';  // <--- Add this line
import App from './App';

test('renders task manager heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/task manager/i);
  expect(headingElement).toBeInTheDocument();
