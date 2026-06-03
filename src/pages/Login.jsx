import React, { useState } from 'react'
import api, { setAuthToken } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post('/usuarios/login', { usuario_o_correo: usuario, contrasena })
      const token = res.data?.token || res.data?.access_token || res.data?.token
      if (token) setAuthToken(token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error')
    }
  }

  return (
    <div className="container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={submit} className="form">
        <label>Usuario o correo</label>
        <input value={usuario} onChange={e=>setUsuario(e.target.value)} required />
        <label>Contraseña</label>
        <input type="password" value={contrasena} onChange={e=>setContrasena(e.target.value)} required />
        <button type="submit">Ingresar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
