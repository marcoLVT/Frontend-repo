import React, { useState } from 'react'
import api, { saveAuth } from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/usuarios/login', 
          { usuario_o_correo: usuario, contrasena },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      const token = res.data?.token || res.data?.access_token || res.data?.token
      const user = res.data?.usuario || null
      if (token) saveAuth(user, token)
      setTimeout(() => navigate('/'), 500)
    } catch (err) {
      console.error('Login Error:', err.response?.data || err.message)
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Credenciales inválidas')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">💳</div>
          <h1>Paymgate</h1>
          <p>Sistema de Pagos</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <div className="form-group">
            <label htmlFor="usuario">Usuario o Correo</label>
            <div className="input-wrapper">
              <span className="icon">👤</span>
              <input
                id="usuario"
                type="text"
                placeholder="Ingresa tu usuario o correo"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <div className="input-wrapper">
              <span className="icon">🔒</span>
              <input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-box">
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  )
}
