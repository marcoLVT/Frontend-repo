import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Transactions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // --- ESTADOS PARA EL CONTROL DEL REEMBOLSO ---
  const [refundingItem, setRefundingItem] = useState(null) 
  const [refundSolicitud, setRefundSolicitud] = useState('')
  const [refundMotivo, setRefundMotivo] = useState('')
  const [refundLoading, setRefundLoading] = useState(false)

  const fetch = () => {
    setLoading(true)
    setError(null)

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

    api.get(`/transacciones/persona/${personaId}`)
      .then(res => setItems(res.data || []))
      .catch(err => setError(err.response?.data?.message || err.message || 'Error al cargar el historial'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const onCreate = () => { 
    navigate('/transacciones/nueva') 
  }
  
  const onEdit = (t) => { 
    navigate(`/transacciones/editar/${t.id}`, { state: { transaction: t } }) 
  }

  const onDelete = async id => {
    if (!confirm('¿Eliminar transacción?')) return
    try {
      await api.delete(`/transacciones/${id}`)
      fetch()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error')
    }
  }

  // --- ENVIAR REEMBOLSO AL BACKEND ---
  const handleConfirmRefund = async (e) => {
    e.preventDefault()
    if (!refundSolicitud.trim() || !refundMotivo.trim()) {
      alert('Todos los campos son obligatorios')
      return
    }

    setRefundLoading(true)
    try {
      await api.post('/transacciones/reembolsar', {
        id: refundingItem.id,
        id_solicitud_reembolso: refundSolicitud,
        motivo: refundMotivo
      })

      alert('Reembolso procesado con éxito')
      
      // Cerrar modal y limpiar formulario
      setRefundingItem(null)
      setRefundSolicitud('')
      setRefundMotivo('')
      
      fetch()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error al procesar el reembolso')
    } finally {
      setRefundLoading(false)
    }
  }

  if (loading) return <p>Cargando transacciones...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <h2>Transacciones</h2>
      <p>Registros basados en la tabla <strong>transacciones</strong>.</p>
      
      <div style={{ marginBottom: 12 }}>
        <button onClick={onCreate}>Nueva transacción</button>
      </div>

      {items.length === 0 ? (
        <p>No hay transacciones.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Solicitud</th>
              <th>Transacción</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(t => {
              const esReembolsado = (t.estado_nombre || t.estado || '').toUpperCase() === 'REEMBOLSADO';
              return (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.id_solicitud || '-'}</td>
                  <td>{t.id_transaccion_pasarela || '-'}</td>
                  <td>{t.nombre_cliente || '-'}</td>
                  <td>{t.telefono || '-'}</td>
                  <td>{t.monto ?? '-'}</td>
                  <td>
                    <span style={{ 
                      color: esReembolsado ? '#d9534f' : 'inherit', 
                      fontWeight: esReembolsado ? 'bold' : 'normal' 
                    }}>
                      {t.estado_nombre || t.estado || '-'}
                    </span>
                  </td>
                  <td>{(t.fecha_creacion || t.created_at) ? new Date(t.fecha_creacion || t.created_at).toLocaleString() : '-'}</td>
                  <td>
                    <button onClick={() => onEdit(t)} disabled={esReembolsado}>Editar</button>
                    
                    <button 
                      onClick={() => setRefundingItem(t)} 
                      disabled={esReembolsado}
                      style={{ 
                        marginLeft: 8, 
                        backgroundColor: esReembolsado ? '#e7e7e7' : '#f0ad4e', 
                        color: esReembolsado ? '#a1a1a1' : 'black',
                        cursor: esReembolsado ? 'not-allowed' : 'pointer',
                        border: '1px solid #ccc'
                      }}
                    >
                      {esReembolsado ? 'Reembolsado' : 'Reembolsar'}
                    </button>
                    
                    <button onClick={() => onDelete(t.id)} style={{ marginLeft: 8 }}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* ==================== MODAL CAPA OSCURA (BACKDROP) ==================== */}
      {refundingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          {/* CONTENEDOR DEL MODAL */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <h3 style={{ marginTop: 0, color: '#d9534f' }}>Procesar Reembolso</h3>
            <p>Vas a solicitar el reembolso para la <strong>Transacción #{refundingItem.id}</strong>.</p>
            <p>Monto original: <strong style={{ fontSize: '1.2em' }}>${refundingItem.monto}</strong></p>
            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '15px 0' }} />
            
            <form onSubmit={handleConfirmRefund}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>ID Solicitud de Reembolso:</label>
                <input 
                  type="text" 
                  value={refundSolicitud} 
                  onChange={e => setRefundSolicitud(e.target.value)}
                  placeholder="Ej: REEM-2026-XYZ"
                  disabled={refundLoading}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Motivo del Reembolso:</label>
                <textarea 
                  value={refundMotivo} 
                  onChange={e => setRefundMotivo(e.target.value)}
                  placeholder="Explique la razón del reembolso..."
                  disabled={refundLoading}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '80px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setRefundingItem(null);
                    setRefundSolicitud('');
                    setRefundMotivo('');
                  }} 
                  disabled={refundLoading} 
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f5f5f5', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={refundLoading} 
                  style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#d9534f', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {refundLoading ? 'Procesando...' : 'Confirmar Reembolso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}