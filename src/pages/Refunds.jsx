import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Refunds() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

    api.get(`/reembolsos/persona/${personaId}`)
      .then(res => setItems(res.data || []))
      .catch(err => setError(err.response?.data?.message || err.message || 'Error al cargar los reembolsos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  // Función para dar estilo dinámico a las etiquetas de estado (Badges)
  const getStatusBadgeStyle = (estado) => {
    const term = (estado || '').toLowerCase();
    let bg = '#e2e8f0'; // Gris por defecto
    let color = '#4a5568';

    if (term.includes('aprobado') || term.includes('completado') || term.includes('exitoso')) {
      bg = '#def7ec';
      color = '#03543f';
    } else if (term.includes('pendiente') || term.includes('proceso')) {
      bg = '#fef3c7';
      color = '#92400e';
    } else if (term.includes('rechazado') || term.includes('cancelado') || term.includes('fallido')) {
      bg = '#fde8e8';
      color = '#9b1c1c';
    }

    return {
      backgroundColor: bg,
      color: color,
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: '600',
      display: 'inline-block'
    };
  };

  // Contenedores de carga y error limpios
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#4a5568', fontSize: '1.1rem' }}>
       Cargando tu historial de reembolsos...
    </div>
  )
  
  if (error) return (
    <div style={{ backgroundColor: '#fde8e8', color: '#9b1c1c', padding: '16px', borderRadius: '8px', border: '1px solid #f8b4b4', margin: '20px 0' }}>
      <strong> Error:</strong> {error}
    </div>
  )

  return (
    <div style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
      
      {/* Encabezado Principal */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.75rem', fontWeight: '700' }}>Mis Reembolsos</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Historial integral de devoluciones asociadas a tus transacciones comerciales.</p>
      </div>

      {items.length === 0 ? (
        <div style={{ backgroundColor: '#fff', textAlign: 'center', padding: '40px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem', margin: '0 0 8px 0' }}>No tienes reembolsos registrados.</p>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#94a3b8' }}>Las solicitudes procesadas aparecerán automáticamente en este panel.</p>
        </div>
      ) : (
        /* Tarjeta Contenedora de la Tabla */
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Cod. Solicitud</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>ID Transacción</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Cliente</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Monto</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, idx) => (
                  <tr 
                    key={r.id} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#334155' }}>#{r.id}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.id_solicitud_reembolso || '-'}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.transaccion_id || '-'}</td>
                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: '500' }}>{r.nombre_cliente || '-'}</td>
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '600' }}>
                      {r.transaccion_monto || r.monto ? `$${parseFloat(r.transaccion_monto || r.monto).toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={getStatusBadgeStyle(r.estado_nombre || r.estado)}>
                        {r.estado_nombre || r.estado || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.88rem' }}>
                      {(r.fecha_creacion || r.created_at) 
                        ? new Date(r.fecha_creacion || r.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) 
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer Informativo de la Tabla */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderTop: '1px solid #e2e8f0', textAlign: 'right', color: '#64748b', fontSize: '0.85rem' }}>
            Mostrando {items.length} registro(s) asignado(s) a tu cuenta.
          </div>
        </div>
      )}
    </div>
  )
}