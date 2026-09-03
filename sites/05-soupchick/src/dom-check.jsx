import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
export function mount() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
