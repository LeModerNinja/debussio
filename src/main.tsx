import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import the test data generator to make it available globally
import './utils/testDataGenerator'

createRoot(document.getElementById("root")!).render(<App />);
