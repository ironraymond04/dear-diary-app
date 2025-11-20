import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import { DiaryProvider } from './context/DiaryContext'
import { ThemeProvider } from './context/ThemeContext'
import DefaultPage from './components/DefaultPage'
import DiaryPage from './components/DiaryPage'
import EntryPage from './components/EntryPage'
import LoginPage from './components/LoginPage'
import MainInterface from './components/MainInterface'
import SignupPage from './components/SignupPage'
import UnlockPage from './components/UnlockPage'

export default function App() {
  return (
    <ThemeProvider>
      <DiaryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<DefaultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/main" element={<MainInterface />} />
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/unlock" element={<UnlockPage />} />
          </Routes>
        </Router>
      </DiaryProvider>
    </ThemeProvider>
  )
}
