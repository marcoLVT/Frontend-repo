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

  const onCreate = () => { navigate('/transacciones/nueva') }
  const onEdit = (t) => { navigate(`/transacciones/editar/${t.id}`, { state: { transaction: t } }) }

  const onDelete = async id => {
    if (!confirm('¿Está seguro de eliminar esta transacción?')) return
    try {
      await api.delete(`/transacciones/${id}`)
      fetch()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error')
    }
  }

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

  // Estilos dinámicos para los Badges de Estado
  const getStatusBadgeStyle = (estado) => {
    const term = (estado || '').toLowerCase();
    let bg = '#e2e8f0'; 
    let color = '#4a5568';

    if (term.includes('aprobado') || term.includes('completado') || term.includes('exitoso') || term.includes('pagado')) {
      bg = '#def7ec'; color = '#03543f';
    } else if (term.includes('pendiente') || term.includes('proceso')) {
      bg = '#fef3c7'; color = '#92400e';
    } else if (term.includes('reembolsado') || term.includes('devuelto')) {
      bg = '#e1effe'; color = '#1e429f';
    } else if (term.includes('rechazado') || term.includes('cancelado') || term.includes('fallido')) {
      bg = '#fde8e8'; color = '#9b1c1c';
    }

    return {
      backgroundColor: bg,
      color: color,
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '0.82rem',
      fontWeight: '600',
      display: 'inline-block'
    };
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#64748b', fontSize: '1.1rem', fontFamily: 'sans-serif' }}>
       Cargando registros de transacciones...
    </div>
  )
  
  if (error) return (
    <div style={{ backgroundColor: '#fde8e8', color: '#9b1c1c', padding: '16px', borderRadius: '8px', border: '1px solid #f8b4b4', margin: '20px', fontFamily: 'sans-serif' }}>
      <strong> Error:</strong> {error}
    </div>
  )

  return (
    <div style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Encabezado e Inicializador */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.75rem', fontWeight: '700' }}>Transacciones</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Registros e historial analítico basados en la tabla principal de auditoría.</p>
        </div>
        <button 
          onClick={onCreate}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          Nuevo
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', textAlign: 'center', padding: '40px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem', margin: '0 0 8px 0' }}>No se encontraron transacciones operacionales.</p>
        </div>
      ) : (
        /* Tarjeta Contenedora de la Tabla */
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Solicitud</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>ID Pasarela</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Cliente</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Teléfono</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Monto</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Fecha</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t, idx) => {
                  const esReembolsado = (t.estado_nombre || t.estado || '').toUpperCase() === 'REEMBOLSADO';
                  return (
                    <tr 
                      key={t.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#334155' }}>#{t.id}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{t.id_solicitud || '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontFamily: 'monospace' }}>{t.id_transaccion_pasarela || '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#334155', fontWeight: '500' }}>{t.nombre_cliente || '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{t.telefono || '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '600' }}>
                        {t.monto ?? false ? `$${parseFloat(t.monto).toFixed(2)}` : '-'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={getStatusBadgeStyle(t.estado_nombre || t.estado)}>
                          {t.estado_nombre || t.estado || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.85rem' }}>
                        {(t.fecha_creacion || t.created_at) ? new Date(t.fecha_creacion || t.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {/* Botón Editar */}
                        <button 
                          onClick={() => onEdit(t)} 
                          disabled={esReembolsado}
                          style={{ backgroundColor: esReembolsado ? '#f1f5f9' : '#ffffff', color: esReembolsado ? '#94a3b8' : '#2563eb', border: '1px solid ' + (esReembolsado ? '#e2e8f0' : '#bfdbfe'), padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500', cursor: esReembolsado ? 'not-allowed' : 'pointer', marginRight: '6px' }}
                        >
                          Editar
                        </button>
                        
                        {/* Botón Reembolsar */}
                        <button 
                          onClick={() => setRefundingItem(t)} 
                          disabled={esReembolsado}
                          style={{ 
                            backgroundColor: esReembolsado ? '#f1f5f9' : '#f59e0b', 
                            color: esReembolsado ? '#94a3b8' : '#ffffff',
                            border: 'none',
                            padding: '6px 12px', 
                            borderRadius: '4px', 
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: esReembolsado ? 'not-allowed' : 'pointer',
                            marginRight: '6px'
                          }}
                        >
                          {esReembolsado ? 'Reembolsado' : 'Reembolsar'}
                        </button>
                        
                        {/* Botón Eliminar */}
                        <button 
                          onClick={() => onDelete(t.id)} 
                          style={{ backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE REEMBOLSO COMPLETAMENTE DECORADO ==================== */}
      {refundingItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff', padding: '28px', borderRadius: '12px',
            width: '90%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0'
          }}>
            
            {/* Cabecera del Modal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem', fontWeight: '700' }}>Emitir Reembolso</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Transacción de origen: <strong>#{refundingItem.id}</strong></p>
              </div>
            </div>

            {/* Caja de Datos */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Cliente:</span>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>{refundingItem.nombre_cliente}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Monto a retornar:</span>
                <span style={{ color: '#b91c1c', fontWeight: '700', fontSize: '1.2rem' }}>
                  ${refundingItem.monto ? parseFloat(refundingItem.monto).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
            
            {/* Formulario */}
            <form onSubmit={handleConfirmRefund}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#344054', fontSize: '0.88rem' }}>
                  Código/ID de la Solicitud:
                </label>
                <input 
                  type="text" 
                  value={refundSolicitud} 
                  onChange={e => setRefundSolicitud(e.target.value)}
                  placeholder="Ej: REEM-2026-XYZ"
                  disabled={refundLoading}
                  required
                  style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #d0d5dd', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#344054', fontSize: '0.88rem' }}>
                  Motivo de la Devolución:
                </label>
                <textarea 
                  value={refundMotivo} 
                  onChange={e => setRefundMotivo(e.target.value)}
                  placeholder="Detalla detalladamente el motivo para el área financiera..."
                  disabled={refundLoading}
                  required
                  style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', minHeight: '90px', borderRadius: '6px', border: '1px solid #d0d5dd', fontSize: '0.9rem', outline: 'none', resize: 'none' }}
                />
              </div>

              {/* Botones de acción del Form */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setRefundingItem(null);
                    setRefundSolicitud('');
                    setRefundMotivo('');
                  }} 
                  disabled={refundLoading} 
                  style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #d0d5dd', backgroundColor: '#ffffff', color: '#344054', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={refundLoading} 
                  style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#dc2626', color: 'white', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  {refundLoading ? 'Procesando...' : 'Aprobar Reembolso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}