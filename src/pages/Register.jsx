import React, { useState } from 'react'
import api, { saveAuth } from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [usuario, setUsuario] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = { usuario, correo, contrasena, nombre, apellido, telefono }
      const res = await api.post('/usuarios/register', payload)
      const token = res.data?.token || res.data?.access_token || res.data?.token
      const user = res.data?.usuario || null
      if (token) saveAuth(user, token)
      setTimeout(() => navigate('/'), 500)
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error en el registro')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">📝</div>
          <h1>Crear Cuenta</h1>
          <p>Únete a Paymgate</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <div className="form-group">
            <label htmlFor="usuario">Usuario</label>
            <div className="input-wrapper">
              <span className="icon">👤</span>
              <input
                id="usuario"
                type="text"
                placeholder="Elige un usuario"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <div className="input-wrapper">
              <span className="icon">✏️</span>
              <input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido</label>
            <div className="input-wrapper">
              <span className="icon">✏️</span>
              <input
                id="apellido"
                type="text"
                placeholder="Tu apellido"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo</label>
            <div className="input-wrapper">
              <span className="icon">✉️</span>
              <input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <div className="input-wrapper">
              <span className="icon">📱</span>
              <input
                id="telefono"
                type="tel"
                placeholder="+51 999 999 999"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                disabled={loading}
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
                placeholder="Crea una contraseña segura"
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
                <span className="spinner"></span> Registrando...
              </>
            ) : (
              'Registrar'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  )
}
