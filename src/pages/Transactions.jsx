import React, { useEffect, useState } from 'react'
import api from '../services/api'
import TransactionForm from '../components/TransactionForm'

export default function Transactions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const fetch = () => {
    setLoading(true); setError(null)
    api.get('/transacciones')
      .then(res => setItems(res.data || []))
      .catch(err => setError(err.response?.data?.message || err.message || 'Error'))
      .finally(()=>setLoading(false))
  }

  useEffect(()=>{ fetch() }, [])

  const onCreate = () => { setEditing(null); setShowForm(true) }
  const onEdit = (t) => { setEditing(t); setShowForm(true) }
  const onDelete = async id => {
    if (!confirm('Eliminar transacción?')) return
    try {
      await api.delete(`/transacciones/${id}`)
      fetch()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error')
    }
  }

  if (loading) return <p>Cargando transacciones...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h2>Transacciones</h2>
      <div style={{marginBottom:12}}>
        <button onClick={onCreate}>Nueva transacción</button>
      </div>

      {showForm && (
        <TransactionForm initial={editing} onSaved={()=>{ setShowForm(false); fetch() }} onCancel={()=>setShowForm(false)} />
      )}

      {items.length === 0 ? (
        <p>No hay transacciones.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Monto</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.nombre_cliente || t.nombre || t.user_name || t.user || t.usuario || '-'}</td>
                <td>{t.monto || t.amount || t.total || '-'}</td>
                <td>{t.estado || t.status || '-'}</td>
                <td>
                  <button onClick={()=>onEdit(t)}>Editar</button>
                  <button onClick={()=>onDelete(t.id)} style={{marginLeft:8}}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
