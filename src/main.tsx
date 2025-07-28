import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import and set up test data generator globally
import { generateTestData } from './utils/testDataGenerator';

// Make it available globally for console testing
(window as any).generateTestData = generateTestData;

createRoot(document.getElementById("root")!).render(<App />);
