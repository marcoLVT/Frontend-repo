import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function TransactionForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({ id_solicitud: '', telefono: '', nombre_cliente: '', monto: '', descripcion: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(()=>{
    if (initial) setForm({
      id_solicitud: initial.id_solicitud || initial.id_solicitud || '',
      telefono: initial.telefono || initial.telefono || '',
      nombre_cliente: initial.nombre_cliente || initial.nombre_cliente || '',
      monto: initial.monto || initial.amount || '',
      descripcion: initial.descripcion || initial.descripcion || ''
    })
  },[initial])

  const handle = e => setForm(f=>({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const payload = {
        id: initial?.id || 0,
        id_solicitud: form.id_solicitud,
        telefono: form.telefono,
        nombre_cliente: form.nombre_cliente,
        monto: form.monto,
        descripcion: form.descripcion
      }
      if (initial && initial.id) {
        await api.put('/transacciones', payload)
      } else {
        await api.post('/transacciones', payload)
      }
      onSaved && onSaved()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="form">
      <label>Usuario ID</label>
      <input name="user_id" value={form.user_id} onChange={handle} required />
      <label>Monto</label>
      <input name="amount" value={form.amount} onChange={handle} required />
      <label>Descripción</label>
      <input name="description" value={form.description} onChange={handle} />
      <div style={{marginTop:8}}>
        <button type="submit" disabled={loading}>{loading? 'Guardando...':'Guardar'}</button>
        <button type="button" onClick={onCancel} style={{marginLeft:8}}>Cancelar</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
