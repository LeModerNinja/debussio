import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/testDataGenerator' // Import to make generateTestData available globally

createRoot(document.getElementById("root")!).render(<App />);
