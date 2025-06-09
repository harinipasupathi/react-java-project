// src/setupTests.js
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),    // deprecated but still used
    removeListener: jest.fn(), // deprecated but still used
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock antd notification to prevent errors during tests
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    notification: {
      error: jest.fn(),
      success: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      open: jest.fn(),
    },
  };
});
