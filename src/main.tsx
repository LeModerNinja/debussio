import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { generateTestData } from './utils/testDataGenerator'

// Make the function available globally for console access during development
if (typeof window !== 'undefined') {
  (window as any).generateTestData = generateTestData;
}

createRoot(document.getElementById("root")!).render(<App />);
