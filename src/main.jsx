import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'   // ← single import for all styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)