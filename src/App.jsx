import React from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Transactions from './pages/Transactions'
import TransactionForm from './components/TransactionForm' // ◄ Importamos el formulario como página independiente
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
          
          {/* Rutas dedicadas para el flujo de Transacciones */}
          <Route path="/transacciones" element={<Transactions />} />
          <Route path="/transacciones/nueva" element={<TransactionForm />} />
          <Route path="/transacciones/editar/:id" element={<TransactionForm />} />
          
          <Route path="/reembolsos" element={<Refunds />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}