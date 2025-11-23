import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { DiaryProvider } from './context/DiaryContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <DiaryProvider>
        <App />
      </DiaryProvider>
    </ThemeProvider>
  </StrictMode>
);