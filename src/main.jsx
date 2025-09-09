import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './hooks/useAuth.jsx'
import App from './App.jsx'
import Generations from './pages/Generations'
import Layout from './components/Layout'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import AuthGuard from './components/AuthGuard'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="generations" element={<Generations />} />
          </Route>
          <Route path="/login" element={
            <AuthGuard>
              <LoginForm />
            </AuthGuard>
          } />
          <Route path="/signup" element={
            <AuthGuard>
              <SignupForm />
            </AuthGuard>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
