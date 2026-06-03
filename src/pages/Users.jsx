import React, { useState } from 'react'
import api, { getCurrentUserInfo, saveAuth, logout } from '../services/api'
import { Link, useNavigate } from 'react-router-dom'

export default function Users() {
  const navigate = useNavigate()
  const currentUser = getCurrentUserInfo()
  const [user, setUser] = useState(currentUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  if (!user) {
    return (
      <div>
        <h2>Perfil de usuario</h2>
        <p>Debes iniciar sesión para ver y editar tu perfil.</p>
        <Link to="/login">Ir a login</Link>
      </div>
    )
  }

  const handleChange = e => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleSave = async e => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const payload = {
        usuario: user.usuario,
        correo: user.correo,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        activo: user.activo ?? 1
      }
      await api.put(`/usuarios/${user.id}`, payload)
      saveAuth(user, null)
      setSuccess('Perfil actualizado correctamente.')
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar tu cuenta? Esta acción es irreversible.')) return
    try {
      await api.delete(`/usuarios/${user.id}`)
      logout()
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al eliminar la cuenta')
    }
  }

  return (
    <div>
      <h2>Mi perfil</h2>
      <p>Edita tus datos de usuario registrados en la tabla <strong>usuarios</strong>.</p>
      <form onSubmit={handleSave} className="form">
        <label>Usuario</label>
        <input name="usuario" value={user.usuario || ''} onChange={handleChange} required />
        <label>Correo</label>
        <input name="correo" type="email" value={user.correo || ''} onChange={handleChange} required />
        <label>Nombre</label>
        <input name="nombre" value={user.nombre || ''} onChange={handleChange} />
        <label>Apellido</label>
        <input name="apellido" value={user.apellido || ''} onChange={handleChange} />
        <label>Teléfono</label>
        <input name="telefono" value={user.telefono || ''} onChange={handleChange} />
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar perfil'}</button>
        <button type="button" onClick={handleDelete} style={{ marginLeft: 8 }} disabled={loading}>Eliminar cuenta</button>
        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
