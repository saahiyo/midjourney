import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './hooks/useAuth.jsx'
import App from './App.jsx'
import Generations from './pages/Generations'
import Layout from './components/Layout'
import LoginForm from './components/LoginForm'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import AuthGuard from './components/AuthGuard'
import RouteAuthGuard from './components/RouteAuthGuard'
import PatternSelector from './components/PatternSelector'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <PatternSelector />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="generations" element={
              <RouteAuthGuard>
                <Generations />
              </RouteAuthGuard>
            } />
          </Route>
          <Route path="/login" element={
            <AuthGuard>
              <LoginForm />
            </AuthGuard>
          } />
          <Route path="/signup" element={
            <AuthGuard>
              <Signup />
            </AuthGuard>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
