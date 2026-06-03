import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Refunds() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = () => {
    setLoading(true)
    setError(null)

    // 1. Obtener el usuario logueado desde el Local Storage
    const userRaw = localStorage.getItem('currentUser')
    
    if (!userRaw) {
      setError('No se encontró el usuario autenticado.')
      setLoading(false)
      return
    }

    const userObj = JSON.parse(userRaw)
    const personaId = userObj.id_persona

    if (!personaId) {
      setError('El usuario no cuenta con un ID de persona válido.')
      setLoading(false)
      return
    }

    // 2. Cargar historial filtrado desde el endpoint seguro
    api.get(`/reembolsos/persona/${personaId}`)
      .then(res => setItems(res.data || []))
      .catch(err => setError(err.response?.data?.message || err.message || 'Error al cargar los reembolsos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  if (loading) return <p>Cargando reembolsos...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h2>Mis Reembolsos</h2>
      <p>Historial de devoluciones asociadas a tu cuenta de cliente.</p>

      {items.length === 0 ? (
        <p>No tienes reembolsos registrados en tu historial.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Solicitud de Reembolso</th>
              <th>ID Transacción</th>
              <th>Cliente</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Fecha</th>
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
                <td>
                  <span style={{ 
                    color: '#d9534f', 
                    fontWeight: 'bold' 
                  }}>
                    {r.estado_nombre || r.estado || '-'}
                  </span>
                </td>
                <td>
                  {(r.fecha_creacion || r.created_at) 
                    ? new Date(r.fecha_creacion || r.created_at).toLocaleString() 
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}