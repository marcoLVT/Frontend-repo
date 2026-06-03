import React, { useState, useEffect } from 'react'
import api from '../services/api'

const STATUS_OPTIONS = [
  { id: 1, label: 'PENDIENTE' },
  { id: 2, label: 'APROBADO' },
  { id: 3, label: 'RECHAZADO' },
  { id: 4, label: 'REEMBOLSADO' },
]

export default function RefundForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    transaccion_id: '',
    id_solicitud_reembolso: '',
    estado_id: 1,
    codigo_respuesta: '',
    motivo: '',
    activo: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initial) {
      setForm({
        transaccion_id: initial.transaccion_id || '',
        id_solicitud_reembolso: initial.id_solicitud_reembolso || '',
        estado_id: initial.estado_id || 1,
        codigo_respuesta: initial.codigo_respuesta || '',
        motivo: initial.motivo || '',
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
        transaccion_id: form.transaccion_id,
        id_solicitud_reembolso: form.id_solicitud_reembolso,
        estado_id: parseInt(form.estado_id, 10),
        codigo_respuesta: form.codigo_respuesta,
        motivo: form.motivo,
        activo: form.activo,
      }
      if (initial && initial.id) {
        await api.put('/reembolsos', payload)
      } else {
        await api.post('/reembolsos', payload)
      }
      onSaved && onSaved()
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="form">
      <label>ID Transacción</label>
      <input name="transaccion_id" value={form.transaccion_id} onChange={handle} required />

      <label>ID Solicitud Reembolso</label>
      <input name="id_solicitud_reembolso" value={form.id_solicitud_reembolso} onChange={handle} required />

      <label>Estado</label>
      <select name="estado_id" value={form.estado_id} onChange={handle}>
        {STATUS_OPTIONS.map(option => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>

      <label>Código de respuesta</label>
      <input name="codigo_respuesta" value={form.codigo_respuesta} onChange={handle} />

      <label>Motivo</label>
      <textarea name="motivo" value={form.motivo} onChange={handle} rows="3" />

      <label>
        <input type="checkbox" name="activo" checked={form.activo === 1} onChange={handle} /> Activo
      </label>

      <div style={{marginTop:8}}>
        <button type="submit" disabled={loading}>{loading? 'Guardando...':'Guardar'}</button>
        <button type="button" onClick={onCancel} style={{marginLeft:8}}>Cancelar</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
