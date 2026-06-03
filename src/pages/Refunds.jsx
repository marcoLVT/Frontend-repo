import React, { useEffect, useState } from 'react'
import api from '../services/api'
import RefundForm from '../components/RefundForm'

export default function Refunds() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetch = () => {
    setLoading(true); setError(null)
    api.get('/reembolsos')
      .then(res => setItems(res.data || []))
      .catch(err => setError(err.response?.data?.message || err.message || 'Error'))
      .finally(()=>setLoading(false))
  }

  useEffect(()=>{ fetch() }, [])

  const onCreate = () => { setEditing(null); setShowForm(true) }
  const onEdit = (r) => { setEditing(r); setShowForm(true) }
  const onDelete = async id => {
    if (!confirm('Eliminar reembolso?')) return
    try {
      await api.delete(`/reembolsos/${id}`)
      fetch()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error')
    }
  }

  if (loading) return <p>Cargando reembolsos...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h2>Reembolsos</h2>
      <p>Registros basados en la tabla <strong>reembolsos</strong>, incluyendo el monto y cliente de la transacción asociada.</p>
      <div style={{marginBottom:12}}>
        <button onClick={onCreate}>Nuevo reembolso</button>
      </div>

      {showForm && (
        <RefundForm initial={editing} onSaved={()=>{ setShowForm(false); fetch() }} onCancel={()=>setShowForm(false)} />
      )}

      {items.length === 0 ? (
        <p>No hay reembolsos.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Solicitud</th>
              <th>Transacción</th>
              <th>Cliente</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.id_solicitud_reembolso || '-'}</td>
                <td>{r.transaccion_id || '-'}</td>
                <td>{r.nombre_cliente || '-'}</td>
                <td>{r.transaccion_monto || r.monto || '-'}</td>
                <td>{r.estado_nombre || '-'}</td>
                <td>{(r.fecha_creacion || r.created_at) ? new Date(r.fecha_creacion || r.created_at).toLocaleString() : '-'}</td>
                <td>
                  <button onClick={()=>onEdit(r)}>Editar</button>
                  <button onClick={()=>onDelete(r.id)} style={{marginLeft:8}}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
