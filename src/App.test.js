import { render, screen } from '@testing-library/react';
import App from './App';

test('renders memory game landing page', () => {
  render(<App />);
  const titleElement = screen.getByText(/Match the Cards, Train Your Mind/i);
  expect(titleElement).toBeInTheDocument();
});
