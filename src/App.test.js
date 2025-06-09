// src/App.test.js
<<<<<<< HEAD
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';  // <--- Add this line
import App from './App';

test('renders task manager heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/task manager/i);
  expect(headingElement).toBeInTheDocument();
=======
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
>>>>>>> 2448a22e02f0d2966b34800ad60775554a427c84
});
