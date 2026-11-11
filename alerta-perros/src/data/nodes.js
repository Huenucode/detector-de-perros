// Registro de nodos del mundo isométrico. x, y = posición en el lienzo (unidades del mundo).
// ay = altura del punto donde llegan los enlaces respecto de la base del dispositivo.
export const NODES = {
  app:        { x: 190,  y: 250, ay: -38, type: 'phone',    name: 'App de registro',     sub: 'celular del productor' },
  torre:      { x: 440,  y: 165, ay: -60, type: 'tower',    name: 'Antena 4G/5G',        sub: 'operador móvil' },
  internet:   { x: 700,  y: 340, ay: -10, type: 'cloud',    name: 'Internet',            sub: '' },
  plataforma: { x: 970,  y: 330, ay: -50, type: 'server',   name: 'Plataforma de datos', sub: 'nube · BD geoespacial' },
  mapa:       { x: 1250, y: 150, ay: -45, type: 'map',      name: 'Mapa de riesgo',      sub: 'productores · GTT' },
  panel:      { x: 1280, y: 370, ay: -45, type: 'panel',    name: 'Panel de análisis',   sub: 'INIA · SAG · municipios' },
  alerta:     { x: 1240, y: 585, ay: -38, type: 'phoneAlert', name: 'Alerta al productor', sub: 'notificación push' },
  oveja1:     { x: 120,  y: 520, ay: -30, type: 'sheep',    name: 'Centinela #042',      sub: 'collar' },
  oveja2:     { x: 235,  y: 590, ay: -30, type: 'sheep',    name: 'Centinela #043',      sub: 'collar' },
  oveja3:     { x: 105,  y: 665, ay: -30, type: 'sheep',    name: 'Centinela #044',      sub: 'collar' },
  gateway:    { x: 470,  y: 560, ay: -40, type: 'gateway',  name: 'Gateway LoRa',        sub: 'receptor en el predio' },
  sirena:     { x: 600,  y: 700, ay: -30, type: 'siren',    name: 'Sirena local',        sub: 'funciona sin internet' },
}

export const anchor = (id) => {
  const n = NODES[id]
  return { x: n.x, y: n.y + n.ay }
}
