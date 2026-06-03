import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout, getCurrentUserInfo } from '../services/api'

export default function NavBar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    setUser(getCurrentUserInfo())
    const onStorage = ()=> setUser(getCurrentUserInfo())
    window.addEventListener('storage', onStorage)
    return ()=> window.removeEventListener('storage', onStorage)
  },[])

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="nav">
      <div className="nav-inner container">
        <Link to="/" className="brand">Paymgate</Link>
        <div className="links">
          <Link to="/transacciones">Transacciones</Link>
          <Link to="/reembolsos">Reembolsos</Link>
          <Link to="/usuarios">Usuarios</Link>
          {user ? (
            <>
              <span style={{marginLeft:12, color:'#111'}}>Hola, {user.nombre || user.usuario}</span>
              <button onClick={handleLogout} style={{marginLeft:12}}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{marginLeft:12}}>Login</Link>
              <Link to="/register" style={{marginLeft:8}}>Registro</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
