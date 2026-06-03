import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function RefundForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({ transaccion_id: '', id_solicitud_reembolso: '', monto: '', motivo: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(()=>{
    if (initial) setForm({
      transaccion_id: initial.transaccion_id || initial.transaccion_id || '',
      id_solicitud_reembolso: initial.id_solicitud_reembolso || initial.id_solicitud_reembolso || '',
      monto: initial.monto || initial.amount || '',
      motivo: initial.motivo || initial.reason || ''
    })
  },[initial])

  const handle = e => setForm(f=>({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const payload = {
        id: initial?.id || 0,
        transaccion_id: form.transaccion_id,
        id_solicitud_reembolso: form.id_solicitud_reembolso,
        monto: form.monto,
        motivo: form.motivo
      }
      if (initial && initial.id) {
        await api.put('/reembolsos', payload)
      } else {
        await api.post('/reembolsos', payload)
      }
      onSaved && onSaved()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="form">
      <label>ID Transacción</label>
      <input name="transaction_id" value={form.transaction_id} onChange={handle} required />
      <label>Monto</label>
      <input name="amount" value={form.amount} onChange={handle} required />
      <label>Motivo</label>
      <input name="reason" value={form.reason} onChange={handle} />
      <div style={{marginTop:8}}>
        <button type="submit" disabled={loading}>{loading? 'Guardando...':'Guardar'}</button>
        <button type="button" onClick={onCancel} style={{marginLeft:8}}>Cancelar</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
