import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ExamProvider } from './context/ExamContext'
import './styles.css'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ExamProvider>
          <App />
        </ExamProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
