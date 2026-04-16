import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Dhamma Mindset App starting...');

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('Dhamma Mindset App rendered successfully');
} catch (error) {
  console.error('Dhamma Mindset App failed to render:', error);
}
