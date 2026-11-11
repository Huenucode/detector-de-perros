// Construye tramas de ejemplo byte por byte para el inspector de paquetes.
// Los valores son ilustrativos (marcados como EJ. en la interfaz).

export const LAYER_COLORS = {
  lorawan: '#6b7a99',
  carga: '#0e9f8e',
  mic: '#8b5cf6',
  ipv4: '#2f6fe4',
  tcp: '#16a34a',
  tls: '#f59e0b',
  app: '#8b5cf6',
}

function int32(v) {
  const b = new DataView(new ArrayBuffer(4))
  b.setInt32(0, v, false)
  return [b.getUint8(0), b.getUint8(1), b.getUint8(2), b.getUint8(3)]
}

const hex = (n) => n.toString(16).padStart(2, '0')
export const hexs = (arr) => arr.map(hex).join(' ')

/**
 * Trama LoRaWAN de subida (uplink) con la carga útil del collar.
 * kind: 'latido' | 'evento'
 */
export function loraFrame({ devAddr = 0x260b1a2c, fcnt = 1, kind = 'evento', accel = 46, pulse = 225, conf = 92, batt = 87, act = 12, lat = -40.52113, lon = -73.06221, clase = 3, mic = [0x5e, 0x91, 0x2c, 0xd7] }) {
  const bytes = []
  const fields = []
  const push = (layer, name, arr, value, note, ex = false) => {
    const start = bytes.length
    bytes.push(...arr)
    fields.push({ layer, name, value, note, ex, range: [start, bytes.length - 1] })
  }

  // LoRaWAN: MHDR + FHDR + FPort
  push('lorawan', 'MHDR', [0x40], '0x40 · datos de subida sin confirmar', 'Tipo de mensaje LoRaWAN: el collar habla, el gateway escucha.')
  const da = [devAddr & 0xff, (devAddr >> 8) & 0xff, (devAddr >> 16) & 0xff, (devAddr >>> 24) & 0xff]
  push('lorawan', 'DevAddr', da, '0x' + devAddr.toString(16).toUpperCase(), 'Dirección del collar en la red. Viaja al revés (little-endian).', true)
  push('lorawan', 'FCtrl', [0x80], '0x80 · ADR activo', 'La red puede ajustar la velocidad de datos para ahorrar batería.')
  push('lorawan', 'FCnt', [fcnt & 0xff, (fcnt >> 8) & 0xff], String(fcnt), 'Contador de mensajes: evita que alguien repita un mensaje viejo.', true)
  push('lorawan', 'FPort', [kind === 'evento' ? 0x02 : 0x01], kind === 'evento' ? '2 · eventos' : '1 · latidos', 'Canal de la aplicación: separa latidos de eventos.')

  if (kind === 'evento') {
    push('carga', 'Tipo', [0x01], '0x01 · EVENTO', 'Mensaje urgente: el collar detectó algo fuera de lo normal.')
    push('carga', 'Clase', [clase], clase === 3 ? '0x03 · huida brusca' : '0x0' + clase, 'Clasificación hecha en el propio collar a partir del acelerómetro.')
    push('carga', 'Pico de aceleración', [accel], (accel / 10).toFixed(1) + ' g', 'Se guarda en décimas de g para caber en un byte.', true)
    push('carga', 'Pulso', [pulse], pulse + ' lpm', 'Latidos por minuto en el momento del evento.', true)
    push('carga', 'Confianza', [conf], conf + ' %', 'Qué tan seguro está el collar de su clasificación.', true)
    push('carga', 'Batería', [batt], batt + ' %', 'Para planificar recambios antes de que el collar quede mudo.', true)
    push('carga', 'Latitud', int32(Math.round(lat * 1e5)), lat.toFixed(5), 'Entero con signo × 100 000. El GPS se enciende solo durante un evento.', true)
    push('carga', 'Longitud', int32(Math.round(lon * 1e5)), lon.toFixed(5), 'Igual que la latitud: 4 bytes, sin decimales.', true)
  } else {
    push('carga', 'Tipo', [0x00], '0x00 · LATIDO', 'Mensaje periódico: el collar sigue vivo.')
    push('carga', 'Actividad', [act], act + ' / 255', 'Movimiento promedio desde el último latido.', true)
    push('carga', 'Pulso', [pulse], pulse + ' lpm', 'Pulso en reposo.', true)
    push('carga', 'Batería', [batt], batt + ' %', 'Sin GPS encendido, la batería dura mucho más.', true)
  }

  push('mic', 'MIC', mic, hexs(mic), 'Código de integridad: el servidor comprueba que nadie alteró el mensaje.', true)

  const count = (l) => fields.filter((f) => f.layer === l).reduce((a, f) => a + f.range[1] - f.range[0] + 1, 0)
  const layers = [
    { id: 'lorawan', name: 'LoRaWAN', size: count('lorawan') },
    { id: 'carga', name: 'Carga útil del collar', size: count('carga') },
    { id: 'mic', name: 'MIC', size: count('mic') },
  ]
  return { bytes, fields, layers, note: 'La carga útil viaja cifrada (AES-128); aquí se muestra ya descifrada por el servidor de red.' }
}

/** Mensaje de alto nivel (HTTPS, push, consulta) mostrado como JSON con sus campos explicados. */
export function jsonMessage({ layers, json, fields, note }) {
  return { json, fields, layers, note }
}
