import React, { useState, useEffect } from 'react'
import api from '../services/api'

const STATUS_OPTIONS = [
  { id: 1, label: 'PENDIENTE' },
  { id: 2, label: 'EXITOSO' },
  { id: 3, label: 'FALLIDO' },
  { id: 4, label: 'REEMBOLSADO' },
]

export default function TransactionForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    id_solicitud: '',
    id_transaccion_pasarela: '',
    telefono: '',
    nombre_cliente: '',
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
    if (initial) {
      setForm({
        id_solicitud: initial.id_solicitud || '',
        id_transaccion_pasarela: initial.id_transaccion_pasarela || '',
        telefono: initial.telefono || '',
        nombre_cliente: initial.nombre_cliente || '',
        monto: initial.monto || initial.amount || '',
        otp: initial.otp || '',
        estado_id: initial.estado_id || 1,
        codigo_respuesta: initial.codigo_respuesta || '',
        descripcion: initial.descripcion || '',
        activo: initial.activo ?? 1,
      })
    }
  }, [initial])

  const handle = e => {
    const value = e.target.name === 'activo' ? (e.target.checked ? 1 : 0) : e.target.value
    setForm(f => ({ ...f, [e.target.name]: value }))
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const payload = {
        id: initial?.id || 0,
        id_solicitud: form.id_solicitud,
        id_transaccion_pasarela: form.id_transaccion_pasarela,
        telefono: form.telefono,
        nombre_cliente: form.nombre_cliente,
        monto: form.monto,
        otp: form.otp,
        estado_id: parseInt(form.estado_id, 10),
        codigo_respuesta: form.codigo_respuesta,
        descripcion: form.descripcion,
        activo: form.activo,
      }
      if (initial && initial.id) {
        await api.put('/transacciones', payload)
      } else {
        await api.post('/transacciones', payload)
      }
      onSaved && onSaved()
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="form">
      <label>ID Solicitud</label>
      <input name="id_solicitud" value={form.id_solicitud} onChange={handle} required />

      <label>ID Transacción Pasarela</label>
      <input name="id_transaccion_pasarela" value={form.id_transaccion_pasarela} onChange={handle} />

      <label>Teléfono</label>
      <input name="telefono" value={form.telefono} onChange={handle} required />

      <label>Nombre cliente</label>
      <input name="nombre_cliente" value={form.nombre_cliente} onChange={handle} required />

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

      <label>
        <input type="checkbox" name="activo" checked={form.activo === 1} onChange={handle} /> Activo
      </label>

      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancelar</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
