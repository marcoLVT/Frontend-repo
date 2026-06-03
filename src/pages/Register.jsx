import React, { useState } from 'react'
import api, { setAuthToken } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [usuario, setUsuario] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [telefono, setTelefono] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError(null)
    try {
      const payload = { usuario, correo, contrasena, nombre, apellido, telefono }
      const res = await api.post('/usuarios/register', payload)
      const token = res.data?.token || res.data?.access_token || res.data?.token
      if (token) setAuthToken(token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error')
    }
  }

  return (
    <div className="container">
      <h2>Registro</h2>
      <form onSubmit={submit} className="form">
        <label>Usuario</label>
        <input value={usuario} onChange={e=>setUsuario(e.target.value)} required />
        <label>Nombre</label>
        <input value={nombre} onChange={e=>setNombre(e.target.value)} required />
        <label>Apellido</label>
        <input value={apellido} onChange={e=>setApellido(e.target.value)} />
        <label>Correo</label>
        <input value={correo} onChange={e=>setCorreo(e.target.value)} required />
        <label>Teléfono</label>
        <input value={telefono} onChange={e=>setTelefono(e.target.value)} />
        <label>Contraseña</label>
        <input type="password" value={contrasena} onChange={e=>setContrasena(e.target.value)} required />
        <button type="submit">Registrar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
