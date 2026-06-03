import React from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Transactions from './pages/Transactions'
import Refunds from './pages/Refunds'
import Users from './pages/Users'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transacciones" element={<Transactions />} />
          <Route path="/reembolsos" element={<Refunds />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}
