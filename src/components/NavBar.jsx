import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setAuthToken } from '../services/api'

export default function NavBar() {
  const [token, setToken] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    setToken(localStorage.getItem('token'))
    const onStorage = ()=> setToken(localStorage.getItem('token'))
    window.addEventListener('storage', onStorage)
    return ()=> window.removeEventListener('storage', onStorage)
  },[])

  const logout = () => {
    setAuthToken(null)
    setToken(null)
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
          {token ? (
            <button onClick={logout} style={{marginLeft:12}}>Cerrar sesión</button>
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
