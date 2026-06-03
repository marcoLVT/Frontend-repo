import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

const STATUS_OPTIONS = [
  { id: 1, label: 'PENDIENTE' },
  { id: 2, label: 'EXITOSO' },
  { id: 3, label: 'FALLIDO' },
  { id: 4, label: 'REEMBOLSADO' },
]

export default function TransactionForm() {
  const { id } = useParams() 
  const location = useLocation()
  const navigate = useNavigate()
  
  const initialData = location.state?.transaction || null

  // Eliminados los estados locales de telefono y nombre_cliente
  const [form, setForm] = useState({
    id_solicitud: '',
    id_transaccion_pasarela: '',
    monto: '',
    otp: '',
    estado_id: 1,
    codigo_respuesta: '',
    descripcion: '',
    activo: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id && initialData) {
      setForm({
        id_solicitud: initialData.id_solicitud || '',
        id_transaccion_pasarela: initialData.id_transaccion_pasarela || '',
        monto: initialData.monto || '',
        otp: initialData.otp || '',
        estado_id: initialData.estado_id || 1,
        codigo_respuesta: initialData.codigo_respuesta || '',
        descripcion: initialData.descripcion || '',
        activo: initialData.activo ?? 1,
      })
    }
  }, [id, initialData])

  const handle = e => {
    const value = e.target.name === 'activo' ? (e.target.checked ? 1 : 0) : e.target.value
    setForm(f => ({ ...f, [e.target.name]: value }))
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Extraer de forma segura el usuario logueado desde la persistencia local
    const userRaw = localStorage.getItem('currentUser')
    if (!userRaw) {
      setError('Sesión inválida o expirada. No se pudo asociar la transacción.')
      setLoading(false)
      return
    }
    
    const userObj = JSON.parse(userRaw)
    const personaId = userObj.id_persona // ID obtenido desde la sesión de la segunda imagen

    try {
      const payload = {
        id: id ? parseInt(id, 10) : 0,
        persona_id: personaId || 1, // Se envía directamente la clave relacional al backend
        id_solicitud: form.id_solicitud,
        id_transaccion_pasarela: form.id_transaccion_pasarela,
        monto: form.monto,
        otp: form.otp,
        estado_id: parseInt(form.estado_id, 10),
        codigo_respuesta: form.codigo_respuesta,
        descripcion: form.descripcion,
        activo: form.activo,
      }

      if (id) {
        await api.put('/transacciones', payload)
      } else {
        await api.post('/transacciones', payload)
      }
      
      navigate('/transacciones')
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="form-container">
      <h2>{id ? `Editar Transacción #${id}` : 'Nueva Transacción'}</h2>
      
      <form onSubmit={submit} className="form">
        <label>ID Solicitud</label>
        <input name="id_solicitud" value={form.id_solicitud} onChange={handle} required />

        <label>ID Transacción Pasarela</label>
        <input name="id_transaccion_pasarela" value={form.id_transaccion_pasarela} onChange={handle} />

        <label>Monto</label>
        <input name="monto" type="number" step="0.01" value={form.monto} onChange={handle} required />

        <label>OTP</label>
        <input name="otp" value={form.otp} onChange={handle} />

        <label>Estado</label>
        <select name="estado_id" value={form.estado_id} onChange={handle}>
          {STATUS_OPTIONS.map(option => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>

        <label>Código de respuesta</label>
        <input name="codigo_respuesta" value={form.codigo_respuesta} onChange={handle} />

        <label>Descripción</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handle} rows="3" />

        <label style={{ display: 'block', margin: '10px 0' }}>
          <input type="checkbox" name="activo" checked={form.activo === 1} onChange={handle} /> Activo
        </label>

        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/transacciones')} style={{ marginLeft: 8 }}>
            Cancelar
          </button>
        </div>
        
        {error && <p className="error" style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  )
}