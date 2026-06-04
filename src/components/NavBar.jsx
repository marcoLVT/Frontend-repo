import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout, getCurrentUserInfo } from '../services/api'

export default function NavBar() {
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    setUser(getCurrentUserInfo())
    const onStorage = () => setUser(getCurrentUserInfo())
    window.addEventListener('storage', onStorage)
    
    // Cerrar el dropdown si se hace click fuera de él
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    setDropdownOpen(false)
    navigate('/')
  }

  // Estilos reutilizables
  const linkStyle = {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.92rem',
    fontWeight: '500',
    transition: 'color 0.2s',
    padding: '8px 12px',
    borderRadius: '6px'
  };

  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 14px',
    color: '#334155',
    textDecoration: 'none',
    fontSize: '0.9rem',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '6px',
    fontFamily: 'inherit',
    transition: 'background-color 0.15s'
  };

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* LOGO / BRAND */}
        <Link to="/" style={{ 
          color: '#0f172a', 
          textDecoration: 'none', 
          fontWeight: '800', 
          fontSize: '1.3rem', 
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ color: '#2563eb' }}>💳</span> Paymgate
        </Link>

        {/* NAVEGACIÓN CENTRAL / DERECHA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/transacciones" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Transacciones</Link>
          <Link to="/reembolsos" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Reembolsos</Link>

          {/* CONTROL DE SESIÓN / DROPDOWN MENU */}
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative', marginLeft: '12px' }}>
              
              {/* Botón Gatillo del Menú */}
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#1e293b',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              >
                {/* Avatar circular mini */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {(user.nombre ? user.nombre[0] : (user.usuario ? user.usuario[0] : 'U')).toUpperCase()}
                </div>
                
                <span>Hola, {user.nombre || user.usuario}</span>
                
                <span style={{ fontSize: '0.7rem', color: '#64748b', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  ▼
                </span>
              </button>

              {/* CONTENIDO DESPLEGABLE */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: '0',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                  width: '210px',
                  padding: '6px',
                  zIndex: 1000,
                  boxSizing: 'border-box'
                }}>
                  {/* Encabezado informativo del Dropdown */}
                  <div style={{ padding: '8px 12px 6px 12px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Gestionar Cuenta
                  </div>

                  {/* Opción Editar Perfil */}
                  <Link 
                    to="/usuarios" 
                    onClick={() => setDropdownOpen(false)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <span>👤</span> Mi perfil
                  </Link>

                  {/* Separador */}
                  <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '6px 0' }} />

                  {/* Opción Cerrar Sesión */}
                  <button 
                    onClick={handleLogout}
                    style={{ ...dropdownItemStyle, color: '#e11d48' }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fff5f5';
                    }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#fff5f5' }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent' }}
                  >
                    <span>🚪</span> Cerrar sesión
                  </button>
                </div>
              )}

            </div>
          ) : (
            // EN CASO DE NO HABER SESIÓN INICIADA
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
              <Link to="/login" style={linkStyle} onMouseEnter={(e) => e.target.style.color = '#2563eb'} onMouseLeave={(e) => e.target.style.color = '#64748b'}>Login</Link>
              <Link to="/register" style={{
                ...linkStyle,
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '8px 16px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                Registro
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}