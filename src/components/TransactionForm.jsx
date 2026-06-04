import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

const STATUS_OPTIONS = [
  { id: 1, label: 'PENDIENTE' },
  { id: 2, label: 'EXITOSO' },
  { id: 3, label: 'FALLIDO' },
  { id: 4, label: 'REEMBOLSADO' },
]

export default function TransactionForm() {
  const { id } = useParams() 
  const location = useLocation()
  const navigate = useNavigate()
  
  const initialData = location.state?.transaction || null

  const [form, setForm] = useState({
    id_solicitud: '',
    id_transaccion_pasarela: '',
    monto: '',
    otp: '',
    estado_id: 1, // Se mantiene de forma predeterminada internamente
    codigo_respuesta: '',
    descripcion: '',
    activo: 1, // Se mantiene activo por defecto internamente
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id && initialData) {
      setForm({
        id_solicitud: initialData.id_solicitud || '',
        id_transaccion_pasarela: initialData.id_transaccion_pasarela || '',
        monto: initialData.monto || '',
        otp: initialData.otp || '',
        estado_id: initialData.estado_id || 1,
        codigo_respuesta: initialData.codigo_respuesta || '',
        descripcion: initialData.descripcion || '',
        activo: initialData.activo ?? 1,
      })
    }
  }, [id, initialData])

  const handle = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const userRaw = localStorage.getItem('currentUser')
    if (!userRaw) {
      setError('Sesión inválida o expirada. No se pudo asociar la transacción.')
      setLoading(false)
      return
    }
    
    const userObj = JSON.parse(userRaw)
    const personaId = userObj.id_persona

    try {
      const payload = {
        id: id ? parseInt(id, 10) : 0,
        persona_id: personaId || 1,
        id_solicitud: form.id_solicitud,
        id_transaccion_pasarela: form.id_transaccion_pasarela,
        monto: form.monto,
        otp: form.otp,
        estado_id: parseInt(form.estado_id, 10),
        codigo_respuesta: form.codigo_respuesta,
        descripcion: form.descripcion,
        activo: form.activo,
      }

      if (id) {
        await api.put('/transacciones', payload)
      } else {
        await api.post('/transacciones', payload)
      }
      
      navigate('/transacciones')
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error')
    } finally { 
      setLoading(false) 
    }
  }

  const montoNumerico = parseFloat(form.monto) || 0;
  const subtotalSimulado = (montoNumerico / 1.18).toFixed(2);
  const igvSimulado = (montoNumerico - subtotalSimulado).toFixed(2);

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#fff',
  };

  return (
    <div style={{ fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Contenedor Principal en Grid para forzar dos columnas de forma paralela */}
      <div style={{ 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'grid', 
        gridTemplateColumns: 'minmax(550px, 1.4fr) minmax(340px, 1fr)', 
        gap: '24px' 
      }}>
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', height: 'fit-content' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            {id ? ` Editar Transacción #${id}` : ' Registrar Nueva Transacción'}
          </h2>

          {error && (
            <div style={{ backgroundColor: '#fde8e8', color: '#9b1c1c', padding: '12px 16px', borderRadius: '6px', border: '1px solid #f8b4b4', marginBottom: '16px', fontSize: '0.9rem' }}>
              <strong> Error:</strong> {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>ID Solicitud *</label>
                <input name="id_solicitud" value={form.id_solicitud} onChange={handle} required placeholder="Ej: SOL-8831" style={inputStyle} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>ID Transacción Pasarela</label>
                <input name="id_transaccion_pasarela" value={form.id_transaccion_pasarela} onChange={handle} placeholder="Ej: sfdfd" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2563eb', fontSize: '0.85rem' }}>Monto Operacional ($) *</label>
                <input name="monto" type="number" step="0.01" value={form.monto} onChange={handle} required placeholder="0.00" style={{ ...inputStyle, borderColor: '#3b82f6', fontWeight: '600' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>OTP (Código de Verificación)</label>
                <input name="otp" value={form.otp} onChange={handle} placeholder="Ej: fdf" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>Código de Respuesta API</label>
                <input name="codigo_respuesta" value={form.codigo_respuesta} onChange={handle} placeholder="Ej: asas" style={inputStyle} />
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>Descripción interna / Notas de Auditoría</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handle} rows="3" placeholder="Añada observaciones sobre el movimiento financiero..." style={{ ...inputStyle, resize: 'vertical', marginBottom: '20px' }} />

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button 
                type="submit" 
                disabled={loading} 
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Guardando...' : 'Guardar Registro'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/transacciones')} 
                style={{ backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: PASARELA DE COMPRAS SIMULADA */}
        <div style={{ 
          backgroundColor: '#0f172a', 
          color: '#ffffff', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}></span>
                <span style={{ fontWeight: '800', letterSpacing: '0.5px', fontSize: '0.95rem', color: '#38bdf8' }}>SECURE GATEWAY</span>
              </div>
              <span style={{ backgroundColor: '#1e293b', color: '#94a3b8', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155', fontWeight: '600' }}>
                PROD-ENV
              </span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 4px 0' }}>Monto total de la transacción</p>
            
            {/* Monto Gigante */}
            <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.4rem', color: '#38bdf8', fontWeight: '500' }}>$</span>
              {montoNumerico > 0 ? montoNumerico.toFixed(2) : '0.00'}
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '400', marginLeft: '6px' }}>USD</span>
            </div>

            {/* Resumen */}
            <div style={{ borderTop: '1px dashed #334155', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resumen de pasarela</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.88rem' }}>
                <span style={{ color: '#94a3b8' }}>Subtotal Base</span>
                <span style={{ color: '#e2e8f0', fontWeight: '500' }}>${subtotalSimulado}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.88rem' }}>
                <span style={{ color: '#94a3b8' }}>Impuestos calculados (18%)</span>
                <span style={{ color: '#e2e8f0', fontWeight: '500' }}>${igvSimulado}</span>
              </div>

              {/* Badge Dinámico de Estado */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Estatus del canal:</span>
                <span style={{ 
                  fontWeight: '700', 
                  fontSize: '0.8rem', 
                  color: form.estado_id == 2 ? '#4ade80' : form.estado_id == 3 ? '#f87171' : form.estado_id == 4 ? '#38bdf8' : '#fbbf24'
                }}>
                  ● {STATUS_OPTIONS.find(o => o.id == form.estado_id)?.label || 'PENDIENTE'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}