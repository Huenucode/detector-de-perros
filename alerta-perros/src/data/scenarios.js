import { loraFrame } from '../lib/payload.js'

export const KINDS = {
  lora:   { name: 'LoRa',        color: '#0e9f8e' },
  https:  { name: '4G · HTTPS',  color: '#2f6fe4' },
  alerta: { name: 'Alerta',      color: '#f59e0b' },
  local:  { name: 'Sirena',      color: '#e0453a' },
  datos:  { name: 'Datos',       color: '#8b5cf6' },
}

export const ETAPAS = ['Captura', 'Comunicaciones', 'Nube', 'Consumidores', 'Soporte']

export const CATEGORIES = [
  { id: 'todos', name: 'Todos' },
  { id: 'app', name: 'App' },
  { id: 'collar', name: 'Collar' },
  { id: 'datos', name: 'Datos' },
]

// ---------- ayudantes para mensajes de alto nivel ----------
function web({ json, fields, appSize, note }) {
  return {
    json,
    fields,
    note: note ?? 'Viaja cifrado con TLS: nadie en el camino puede leerlo. Esto es lo que arma la aplicación antes de cifrar.',
    layers: [
      { id: 'ipv4', name: 'IPv4', size: 20 },
      { id: 'tcp', name: 'TCP', size: 20 },
      { id: 'tls', name: 'TLS 1.3', size: 22 },
      { id: 'app', name: 'HTTP + JSON', size: appSize },
    ],
  }
}

const REGISTRO_JSON = {
  evento: 'ataque',
  fecha: '2026-11-11T14:01:52-03:00',
  ubicacion: { lat: -40.52113, lon: -73.06221, precision_m: 6 },
  especie: 'ovino',
  muertos: 2,
  heridos: 3,
  abortos: 0,
  perros: { cantidad: 3, con_dueno: 'no se sabe' },
  foto: 'evento_0193.jpg',
}

const REGISTRO_FIELDS = [
  { layer: 'app', name: 'POST /eventos', key: null, value: 'HTTP/2', note: 'La app crea un evento nuevo en la plataforma.' },
  { layer: 'app', name: 'evento', key: 'evento', value: 'ataque', note: 'Ataque o avistamiento: ambos alimentan el mapa.' },
  { layer: 'app', name: 'fecha', key: 'fecha', value: '14:01:52', note: 'Hora del evento, no la del envío. Importa cuando no hay señal.', ex: true },
  { layer: 'app', name: 'ubicacion', key: 'ubicacion', value: '-40.52113, -73.06221', note: 'GPS del celular. Coordenada exacta: solo la ven el productor y el equipo autorizado.', ex: true },
  { layer: 'app', name: 'especie', key: 'especie', value: 'ovino', note: 'Ovino o bovino: reaccionan distinto y se analizan por separado.' },
  { layer: 'app', name: 'muertos / heridos / abortos', key: 'muertos', value: '2 / 3 / 0', note: 'La base para estimar pérdidas por comuna y temporada.', ex: true },
  { layer: 'app', name: 'perros.con_dueno', key: 'perros', value: 'no se sabe', note: 'No todos los perros son asilvestrados: registrar la diferencia orienta la medida correcta.' },
  { layer: 'app', name: 'foto', key: 'foto', value: '1,2 MB', note: 'Respaldo visual de las pérdidas del productor.', ex: true },
]

// ---------- escenarios ----------
export const SCENARIOS = [
  // ======================= APP =======================
  {
    id: 'registro',
    cat: 'app',
    title: 'Registro de un ataque',
    subtitle: 'App con señal 4G/5G',
    overview: {
      desc: 'Un productor encuentra ovejas atacadas y registra el evento desde el celular en menos de un minuto. Con señal, el registro viaja de inmediato a la plataforma y actualiza el mapa de riesgo del sector.',
      facts: [
        ['Componente', 'App de registro'],
        ['Para quién', 'Productores, veterinarios, asesores'],
        ['Red', '4G/5G sobre HTTPS'],
        ['Captura', 'Menos de un minuto'],
        ['Salida', 'Mapa de riesgo por sector'],
      ],
    },
    steps: [
      {
        title: 'Nuevo evento',
        subtitle: 'El productor completa el registro',
        etapa: 0,
        show: ['app'],
        overlay: { type: 'form' },
        hold: 6.5,
        desc: 'Foto, ubicación tomada del GPS del celular, especie afectada, animales muertos, heridos o abortos, y si los perros parecían tener dueño. Todo en tres toques: la app propone valores y el productor confirma.',
        facts: [['Especie', 'Ovino'], ['Muertos / heridos', '2 / 3'], ['Siguiente salto', 'Antena 4G/5G']],
      },
      {
        title: 'Envío por 4G/5G',
        subtitle: 'El registro sale cifrado hacia la nube',
        etapa: 1,
        show: ['app', 'torre', 'internet', 'plataforma'],
        desc: 'La app envía el registro con su foto por HTTPS. La antena del operador lo entrega a internet y de ahí llega a la plataforma de datos. En el camino nadie puede leerlo.',
        facts: [['Protocolo', 'HTTPS (TLS 1.3)'], ['Tamaño', '≈ 1,2 MB con foto']],
        packets: [
          {
            at: 0.3, path: ['app', 'torre', 'internet', 'plataforma'], kind: 'https', label: 'REGISTRO', info: 'POST /eventos',
            proto: 'HTTPS', size: '1,2 MB', time: '14:02:07.120', seen: 'Visto entre el celular y la plataforma',
            detail: web({ json: REGISTRO_JSON, fields: REGISTRO_FIELDS, appSize: 1200 }),
          },
        ],
      },
      {
        title: 'Ingesta',
        subtitle: 'La plataforma valida y guarda',
        etapa: 2,
        show: ['app', 'torre', 'internet', 'plataforma'],
        badges: { plataforma: { text: 'BD GEOESPACIAL +1', tone: 'ok' } },
        desc: 'La plataforma revisa que los campos tengan sentido, guarda el punto en la base de datos geoespacial y responde a la app. El productor queda con un respaldo fechado de sus pérdidas.',
        facts: [['Respuesta', '201 Created'], ['Evento', '#0193']],
        packets: [
          {
            at: 0.3, path: ['plataforma', 'internet', 'torre', 'app'], kind: 'https', label: 'CONFIRMACIÓN', info: '201 Created · evento #0193',
            proto: 'HTTPS', size: '412 B', time: '14:02:08.940', seen: 'Visto entre la plataforma y el celular',
            detail: web({
              appSize: 220,
              json: { estado: 201, id: 'EV-0193', sector: 'S-14', guardado: '2026-11-11T14:02:08-03:00', respaldo_pdf: '/eventos/EV-0193/respaldo' },
              fields: [
                { layer: 'app', name: 'estado', key: 'estado', value: '201 Created', note: 'El evento quedó guardado.' },
                { layer: 'app', name: 'id', key: 'id', value: 'EV-0193', note: 'Identificador para seguir el caso.', ex: true },
                { layer: 'app', name: 'sector', key: 'sector', value: 'S-14', note: 'Sector al que se suma el evento en el mapa agregado.', ex: true },
                { layer: 'app', name: 'respaldo_pdf', key: 'respaldo_pdf', value: 'enlace', note: 'El productor recibe algo a cambio: un respaldo de sus pérdidas.' },
              ],
            }),
          },
        ],
      },
      {
        title: 'Mapa de riesgo',
        subtitle: 'El foco del sector se actualiza',
        etapa: 3,
        show: ['app', 'torre', 'internet', 'plataforma', 'mapa'],
        overlay: { type: 'map', mode: 'grid', highlight: 14 },
        desc: 'El motor de mapas suma el evento al sector, no al predio. Los vecinos ven focos agregados y su evolución, nunca la ubicación exacta de otro productor.',
        facts: [['Sector', 'S-14'], ['Eventos 30 días', '4'], ['Nivel', 'Alto']],
        packets: [
          {
            at: 0.3, path: ['plataforma', 'mapa'], kind: 'datos', label: 'SECTOR', info: 'S-14 · 4 eventos (30 d)',
            proto: 'Teselas', size: '3,4 KB', time: '14:02:09.300', seen: 'Visto entre la plataforma y el mapa',
            detail: web({
              appSize: 3400,
              note: 'El mapa recibe datos ya agregados: la coordenada exacta nunca sale de la base.',
              json: { sector: 'S-14', comuna: 'Osorno', eventos_30d: 4, tendencia: 'subiendo', nivel: 'alto', predios_que_reportan: 6 },
              fields: [
                { layer: 'app', name: 'sector', key: 'sector', value: 'S-14', note: 'Unidad mínima que ve un vecino.', ex: true },
                { layer: 'app', name: 'eventos_30d', key: 'eventos_30d', value: '4', note: 'Conteo agregado, sin predios individuales.', ex: true },
                { layer: 'app', name: 'tendencia', key: 'tendencia', value: 'subiendo', note: 'Evolución del foco en el tiempo.', ex: true },
                { layer: 'app', name: 'predios_que_reportan', key: 'predios_que_reportan', value: '6', note: 'Mide la participación: el reporte decae si no devuelve valor.', ex: true },
              ],
            }),
          },
        ],
      },
    ],
    summary: {
      title: 'Evento en el mapa',
      subtitle: 'Del potrero al mapa en segundos',
      desc: 'El productor registró el ataque en menos de un minuto, recibió su respaldo y el sector S-14 subió de nivel. Pulsa REPETIR para verlo de nuevo.',
      facts: [['Paquetes', '3'], ['Saltos', 'Celular → antena → internet → nube'], ['Visible para vecinos', 'Solo el sector'], ['Respaldo', 'Enlace al evento #0193']],
    },
  },

  {
    id: 'sin-senal',
    cat: 'app',
    title: 'Registro sin señal',
    subtitle: 'Guarda ahora, sincroniza después',
    overview: {
      desc: 'En muchos potreros no hay cobertura. La app está pensada para funcionar sin señal: guarda cada registro en el teléfono y lo sincroniza solo cuando vuelve la conexión.',
      facts: [['Diseño', 'Offline-first'], ['Datos guardados', 'Hora y lugar reales del evento'], ['Sincronización', 'Automática al volver la señal']],
    },
    steps: [
      {
        title: 'Sin cobertura',
        subtitle: 'El envío no puede salir',
        etapa: 0,
        show: ['app', 'torre'],
        badges: { torre: { text: 'SIN SEÑAL', tone: 'bad' } },
        overlay: { type: 'queue', items: 1 },
        desc: 'El productor registra el ataque en el potrero, pero no hay señal. La app intenta enviar, detecta que no hay red y guarda el registro en el teléfono con la hora y el lugar del momento.',
        facts: [['Estado', 'En cola local'], ['Pérdida de datos', 'Ninguna']],
        packets: [
          {
            at: 0.4, path: ['app', 'torre'], fail: 0, kind: 'https', label: 'REGISTRO', info: 'sin red · queda en cola',
            proto: 'HTTPS', size: '—', time: '07:48:15.010', seen: 'No llegó a salir del celular',
            detail: web({
              appSize: 1200,
              note: 'Este paquete nunca salió: la app lo guardó en el teléfono para enviarlo más tarde.',
              json: { ...REGISTRO_JSON, fecha: '2026-11-11T07:48:02-03:00', estado_sync: 'pendiente' },
              fields: [
                { layer: 'app', name: 'fecha', key: 'fecha', value: '07:48:02', note: 'Se conserva la hora real del evento.', ex: true },
                { layer: 'app', name: 'ubicacion', key: 'ubicacion', value: 'GPS', note: 'El GPS funciona sin señal de celular.', ex: true },
                { layer: 'app', name: 'estado_sync', key: 'estado_sync', value: 'pendiente', note: 'Marca local: falta enviarlo.' },
              ],
            }),
          },
        ],
      },
      {
        title: 'En cola',
        subtitle: 'Los registros esperan en el teléfono',
        etapa: 0,
        show: ['app', 'torre'],
        badges: { torre: { text: 'SIN SEÑAL', tone: 'bad' }, app: { text: '3 EN COLA', tone: 'warn' } },
        overlay: { type: 'queue', items: 3 },
        hold: 5,
        desc: 'Durante la jornada el productor anota dos avistamientos más. Cada uno queda en la cola local, en orden, sin que tenga que hacer nada especial.',
        facts: [['Pendientes', '3'], ['Acción del productor', 'Ninguna']],
      },
      {
        title: 'Vuelve la señal',
        subtitle: 'La app sincroniza sola',
        etapa: 1,
        show: ['app', 'torre', 'internet', 'plataforma'],
        badges: { torre: { text: '4G', tone: 'ok' } },
        overlay: { type: 'queue', items: 3, syncing: true },
        desc: 'Al llegar a la casa vuelve la cobertura. La app envía los registros pendientes en orden. Cada uno conserva la hora y el lugar del evento, no la hora del envío.',
        facts: [['Envíos', '3'], ['Orden', 'Del más antiguo al más nuevo']],
        packets: [
          { at: 0.3, path: ['app', 'torre', 'internet', 'plataforma'], kind: 'https', label: 'SYNC 1/3', info: 'ataque · 07:48', proto: 'HTTPS', size: '1,2 MB', time: '18:30:41.500', seen: 'Visto entre el celular y la plataforma', detail: web({ json: { ...REGISTRO_JSON, fecha: '2026-11-11T07:48:02-03:00' }, fields: REGISTRO_FIELDS.slice(0, 4), appSize: 1200 }) },
          { at: 0.9, path: ['app', 'torre', 'internet', 'plataforma'], kind: 'https', label: 'SYNC 2/3', info: 'avistamiento · 11:20', proto: 'HTTPS', size: '640 KB', time: '18:30:42.110', seen: 'Visto entre el celular y la plataforma', detail: web({ appSize: 640, json: { evento: 'avistamiento', fecha: '2026-11-11T11:20:30-03:00', perros: { cantidad: 4, con_dueno: 'no' }, foto: 'avist_0194.jpg' }, fields: [{ layer: 'app', name: 'evento', key: 'evento', value: 'avistamiento', note: 'Sin animales afectados, pero útil para anticipar focos.' }, { layer: 'app', name: 'perros', key: 'perros', value: '4 · sin dueño', note: 'Dato clave para orientar la medida de control.', ex: true }] }) },
          { at: 1.5, path: ['app', 'torre', 'internet', 'plataforma'], kind: 'https', label: 'SYNC 3/3', info: 'avistamiento · 16:05', proto: 'HTTPS', size: '590 KB', time: '18:30:42.730', seen: 'Visto entre el celular y la plataforma', detail: web({ appSize: 590, json: { evento: 'avistamiento', fecha: '2026-11-11T16:05:12-03:00', perros: { cantidad: 2, con_dueno: 'sí, con collar' } }, fields: [{ layer: 'app', name: 'perros.con_dueno', key: 'perros', value: 'sí, con collar', note: 'Perros con dueño que deambulan también atacan ganado.', ex: true }] }) },
        ],
      },
      {
        title: 'Confirmación',
        subtitle: 'La cola queda vacía',
        etapa: 2,
        show: ['app', 'torre', 'internet', 'plataforma'],
        badges: { torre: { text: '4G', tone: 'ok' }, plataforma: { text: '+3 EVENTOS', tone: 'ok' } },
        overlay: { type: 'queue', items: 0 },
        desc: 'La plataforma confirma los tres registros de una vez. La app los marca como enviados y limpia la cola.',
        facts: [['Respuesta', '201 · 3 guardados'], ['Cola', 'Vacía']],
        packets: [
          { at: 0.3, path: ['plataforma', 'internet', 'torre', 'app'], kind: 'https', label: 'CONFIRMACIÓN', info: '201 · 3 sincronizados', proto: 'HTTPS', size: '486 B', time: '18:30:43.400', seen: 'Visto entre la plataforma y el celular', detail: web({ appSize: 240, json: { estado: 201, guardados: ['EV-0195', 'AV-0196', 'AV-0197'] }, fields: [{ layer: 'app', name: 'guardados', key: 'guardados', value: '3 ids', note: 'Uno por cada registro de la cola.', ex: true }] }) },
        ],
      },
    ],
    summary: {
      title: 'Cola sincronizada',
      subtitle: 'Sin señal no es sin datos',
      desc: 'Los tres registros del día llegaron a la plataforma con su hora y lugar reales. Pulsa REPETIR para verlo de nuevo.',
      facts: [['Registros', '3'], ['Envío', 'Automático al volver la señal'], ['Pérdida', 'Ninguna']],
    },
  },

  // ======================= COLLAR =======================
  {
    id: 'collar-ataque',
    cat: 'collar',
    title: 'Ataque detectado',
    subtitle: 'Collar, LoRa y decisión de rebaño',
    overview: {
      desc: 'Línea 2 de la propuesta, en I+D: un collar de bajo costo en ovejas centinela detecta el ataque en sus primeros minutos y avisa al productor. La alarma se activa solo si varios animales reaccionan a la vez.',
      facts: [
        ['Componente', 'Collar de alerta temprana'],
        ['Centinelas', '10 % a 20 % del rebaño'],
        ['Sensores', 'Acelerómetro y pulso'],
        ['Radio', 'LoRa hacia el gateway del predio'],
        ['Costo de referencia', '≈ US$65 por unidad (lotes de 100)'],
      ],
    },
    steps: [
      {
        title: 'Rebaño tranquilo',
        subtitle: 'Latido periódico, GPS apagado',
        etapa: 0,
        show: ['oveja1', 'oveja2', 'oveja3', 'gateway'],
        desc: 'Cada collar centinela envía cada cierto tiempo un mensaje corto con actividad, pulso y batería. El GPS permanece apagado: así la batería dura semanas.',
        facts: [['Mensaje', 'Latido · 17 B'], ['GPS', 'Apagado']],
        packets: [
          { at: 0.3, path: ['oveja2', 'gateway'], kind: 'lora', label: 'LATIDO', info: 'actividad baja · 74 lpm', proto: 'LoRaWAN', size: '17 B', time: '03:40:00.000', seen: 'Visto en el aire, entre el collar y el gateway', detail: loraFrame({ kind: 'latido', fcnt: 1287, pulse: 74, act: 12, batt: 88, devAddr: 0x260b1a2b, mic: [0x9a, 0x13, 0x77, 0x0c] }) },
        ],
      },
      {
        title: 'Huida brusca',
        subtitle: 'El acelerómetro y el pulso se disparan',
        etapa: 0,
        show: ['oveja1', 'oveja2', 'oveja3', 'gateway'],
        alarmed: ['oveja1', 'oveja2', 'oveja3'],
        overlay: { type: 'sensor' },
        hold: 6,
        desc: 'Los perros entran al potrero. El acelerómetro registra la carrera y el pulso sube de golpe. En Suiza un collar midió que el pulso de las ovejas saltó de 60–80 a 225 latidos por minuto en un ataque simulado.',
        facts: [['Pulso', '74 → 225 lpm'], ['Aceleración', 'Pico de 4,6 g']],
      },
      {
        title: 'Eventos por LoRa',
        subtitle: 'Tres collares avisan casi a la vez',
        etapa: 1,
        show: ['oveja1', 'oveja2', 'oveja3', 'gateway'],
        alarmed: ['oveja1', 'oveja2', 'oveja3'],
        desc: 'Cada collar clasifica el evento, enciende el GPS solo ahora y envía un mensaje por radio LoRa al receptor del predio. LoRa cubre largas distancias con muy poca energía.',
        facts: [['Mensajes', '3 eventos · 27 B c/u'], ['GPS', 'Encendido solo en el evento']],
        packets: [
          { at: 0.2, path: ['oveja1', 'gateway'], kind: 'lora', label: 'EVENTO', info: 'huida · 225 lpm', proto: 'LoRaWAN', size: '27 B', time: '03:41:12.340', seen: 'Visto en el aire, entre el collar #042 y el gateway', detail: loraFrame({ kind: 'evento', fcnt: 1311, devAddr: 0x260b1a2a, pulse: 225, accel: 46, conf: 92, lat: -40.52113, lon: -73.06221 }) },
          { at: 0.6, path: ['oveja2', 'gateway'], kind: 'lora', label: 'EVENTO', info: 'huida · 212 lpm', proto: 'LoRaWAN', size: '27 B', time: '03:41:12.910', seen: 'Visto en el aire, entre el collar #043 y el gateway', detail: loraFrame({ kind: 'evento', fcnt: 1288, devAddr: 0x260b1a2b, pulse: 212, accel: 41, conf: 88, batt: 86, lat: -40.52131, lon: -73.06198, mic: [0x11, 0xe4, 0x3a, 0x6f] }) },
          { at: 1.0, path: ['oveja3', 'gateway'], kind: 'lora', label: 'EVENTO', info: 'huida · 219 lpm', proto: 'LoRaWAN', size: '27 B', time: '03:41:13.480', seen: 'Visto en el aire, entre el collar #044 y el gateway', detail: loraFrame({ kind: 'evento', fcnt: 1302, devAddr: 0x260b1a2c, pulse: 219, accel: 52, conf: 95, batt: 84, lat: -40.52098, lon: -73.06240, mic: [0xc8, 0x02, 0x9d, 0x45] }) },
        ],
      },
      {
        title: 'Decisión de rebaño',
        subtitle: '3 de 5 centinelas reaccionan',
        etapa: 1,
        show: ['oveja1', 'oveja2', 'oveja3', 'gateway', 'sirena'],
        alarmed: ['oveja1', 'oveja2', 'oveja3'],
        badges: { gateway: { text: '3/5 EN 60 s', tone: 'warn' }, sirena: { text: 'ACTIVA', tone: 'bad', after: 1.2 } },
        sirenOn: 1.2,
        overlay: { type: 'herd', reacting: 3, total: 5 },
        hold: 5.5,
        desc: 'El gateway no alerta por un solo animal: espera que varios reaccionen al mismo tiempo. Con 3 de 5 centinelas dentro de la ventana, activa la sirena del predio aunque no haya internet.',
        facts: [['Regla', 'Varios animales a la vez'], ['Sirena', 'Local, sin internet']],
        packets: [
          { at: 0.5, path: ['gateway', 'sirena'], kind: 'local', label: 'SIRENA', info: 'alarma local · ON', proto: 'Relé', size: '—', time: '03:41:14.020', seen: 'Señal eléctrica dentro del predio', detail: { note: 'No es un paquete de red: el gateway cierra un relé y enciende la sirena. Por eso funciona aunque no haya internet.', layers: [{ id: 'app', name: 'Señal local', size: 1 }], json: { salida: 'relé 1', estado: 'ON', duracion_s: 90, motivo: 'rebaño 3/5' }, fields: [{ layer: 'app', name: 'estado', key: 'estado', value: 'ON', note: 'La sirena ahuyenta a los perros y avisa en la casa.' }, { layer: 'app', name: 'duracion_s', key: 'duracion_s', value: '90 s', note: 'Duración configurable en el piloto.', ex: true }, { layer: 'app', name: 'motivo', key: 'motivo', value: '3 de 5', note: 'Decisión tomada a nivel de rebaño.', ex: true }] } },
        ],
      },
      {
        title: 'Hacia la nube',
        subtitle: 'El gateway reenvía la alerta',
        etapa: 2,
        show: ['oveja1', 'oveja2', 'oveja3', 'gateway', 'sirena', 'internet', 'plataforma'],
        sirenOn: 0,
        desc: 'Si el gateway tiene conexión, reenvía la alerta a la plataforma con la ubicación de cada collar y la hora de cada evento. El motor de alertas la registra en el sector.',
        facts: [['Fuentes', '3 collares'], ['Sector', 'S-14']],
        packets: [
          { at: 0.3, path: ['gateway', 'internet', 'plataforma'], kind: 'https', label: 'ALERTA REBAÑO', info: '3 collares · sector S-14', proto: 'HTTPS', size: '1,1 KB', time: '03:41:14.600', seen: 'Visto entre el gateway y la plataforma', detail: web({ appSize: 860, json: { tipo: 'alerta_rebano', predio: 'P-0281', collares: ['#042', '#043', '#044'], reaccionan: '3/5', ventana_s: 60, sirena: 'activada', sector: 'S-14' }, fields: [{ layer: 'app', name: 'collares', key: 'collares', value: '#042 #043 #044', note: 'Qué centinelas reaccionaron.', ex: true }, { layer: 'app', name: 'reaccionan', key: 'reaccionan', value: '3/5', note: 'La razón de la alerta.', ex: true }, { layer: 'app', name: 'sirena', key: 'sirena', value: 'activada', note: 'La plataforma sabe que ya sonó en el predio.' }] }) },
        ],
      },
      {
        title: 'Aviso al productor',
        subtitle: 'Notificación en minutos',
        etapa: 3,
        show: ['oveja1', 'oveja2', 'oveja3', 'gateway', 'sirena', 'internet', 'plataforma', 'alerta'],
        sirenOn: 0,
        badges: { alerta: { text: 'POSIBLE ATAQUE', tone: 'warn', after: 1.6 } },
        desc: 'La plataforma envía una notificación al celular del productor, que puede acudir en minutos. La alerta queda pendiente hasta que alguien la confirme con un registro en la app.',
        facts: [['Canal', 'Notificación push'], ['Estado', 'Pendiente de confirmar']],
        packets: [
          { at: 0.3, path: ['plataforma', 'alerta'], kind: 'alerta', label: 'PUSH', info: 'posible ataque · potrero norte', proto: 'Push', size: '2,3 KB', time: '03:41:15.200', seen: 'Visto entre la plataforma y el celular del productor', detail: web({ appSize: 300, json: { titulo: 'Posible ataque en tu predio', cuerpo: '3 ovejas centinela reaccionaron · potrero norte', accion: 'Registrar lo que encontraste', prioridad: 'alta' }, fields: [{ layer: 'app', name: 'titulo', key: 'titulo', value: 'Posible ataque', note: 'Mensaje breve, legible en la pantalla bloqueada.' }, { layer: 'app', name: 'accion', key: 'accion', value: 'Registrar', note: 'Abre la app para confirmar: así la app valida al collar.' }] }) },
        ],
      },
    ],
    summary: {
      title: 'Alerta entregada',
      subtitle: 'Del pulso de una oveja al celular',
      desc: 'Tres collares detectaron la huida, el gateway decidió a nivel de rebaño, la sirena sonó en el predio y el productor recibió el aviso. Pulsa REPETIR para verlo de nuevo.',
      facts: [['Mensajes LoRa', '4 (1 latido + 3 eventos)'], ['Decisión', 'A nivel de rebaño'], ['Sin internet', 'La sirena suena igual'], ['Por dónde partir', '5 a 10 collares en ovinos']],
    },
  },

  {
    id: 'falsa-alarma',
    cat: 'collar',
    title: 'Falsa alarma evitada',
    subtitle: 'Arreo, tormenta o perro del predio',
    overview: {
      desc: 'Uno de los riesgos del collar son las falsas alarmas. Por eso la decisión se toma a nivel de rebaño: un animal asustado no basta para hacer sonar la sirena.',
      facts: [['Riesgo', 'Falsas alarmas'], ['Cómo se aborda', 'Decisión de rebaño y ajuste con datos del piloto']],
    },
    steps: [
      {
        title: 'Un solo animal se asusta',
        subtitle: 'Un collar envía un evento',
        etapa: 0,
        show: ['oveja1', 'oveja2', 'oveja3', 'gateway'],
        alarmed: ['oveja3'],
        desc: 'Un trueno, un arreo o el perro del propio predio asustan a una oveja. Su collar detecta la carrera y envía un evento por LoRa.',
        facts: [['Collares que reaccionan', '1']],
        packets: [
          { at: 0.3, path: ['oveja3', 'gateway'], kind: 'lora', label: 'EVENTO', info: 'huida · 161 lpm', proto: 'LoRaWAN', size: '27 B', time: '22:15:03.770', seen: 'Visto en el aire, entre el collar #044 y el gateway', detail: loraFrame({ kind: 'evento', fcnt: 1340, devAddr: 0x260b1a2c, pulse: 161, accel: 33, conf: 61, batt: 83, lat: -40.52098, lon: -73.06240, mic: [0x4d, 0xb0, 0x18, 0xe2] }) },
        ],
      },
      {
        title: 'Ventana de espera',
        subtitle: '1 de 5: no hay patrón de ataque',
        etapa: 1,
        show: ['oveja1', 'oveja2', 'oveja3', 'gateway', 'sirena'],
        badges: { gateway: { text: '1/5 · SIN ALARMA', tone: 'ok' } },
        overlay: { type: 'herd', reacting: 1, total: 5 },
        hold: 5.5,
        desc: 'El gateway abre una ventana de tiempo y espera. Ningún otro centinela reacciona, así que no hay patrón de ataque y la sirena no suena.',
        facts: [['Regla', 'Varios animales a la vez'], ['Sirena', 'Apagada']],
      },
      {
        title: 'Registro para calibrar',
        subtitle: 'El evento aislado igual se guarda',
        etapa: 2,
        show: ['oveja1', 'oveja2', 'oveja3', 'gateway', 'sirena', 'internet', 'plataforma'],
        desc: 'El evento descartado se guarda en la plataforma. Con los datos del piloto se ajustan los umbrales para que arreos, tormentas o perros del predio no disparen alarmas.',
        facts: [['Uso', 'Ajustar umbrales'], ['Origen del ajuste', 'Datos del piloto']],
        packets: [
          { at: 0.3, path: ['gateway', 'internet', 'plataforma'], kind: 'datos', label: 'DESCARTADO', info: 'evento aislado · para calibrar', proto: 'HTTPS', size: '640 B', time: '22:16:04.100', seen: 'Visto entre el gateway y la plataforma', detail: web({ appSize: 380, json: { tipo: 'evento_aislado', collar: '#044', reaccionan: '1/5', sirena: 'no', uso: 'calibracion' }, fields: [{ layer: 'app', name: 'reaccionan', key: 'reaccionan', value: '1/5', note: 'Por debajo del umbral de rebaño.', ex: true }, { layer: 'app', name: 'uso', key: 'uso', value: 'calibración', note: 'Material para reducir falsas alarmas.' }] }) },
        ],
      },
    ],
    summary: {
      title: 'Sirena en silencio',
      subtitle: 'Una oveja no hace un ataque',
      desc: 'El gateway descartó el evento aislado y lo envió para calibrar el modelo. Pulsa REPETIR para verlo de nuevo.',
      facts: [['Reaccionaron', '1 de 5'], ['Sirena', 'No sonó'], ['Dato', 'Guardado para calibrar']],
    },
  },

  // ======================= DATOS =======================
  {
    id: 'validacion',
    cat: 'datos',
    title: 'App + collar',
    subtitle: 'Cómo se conectan las dos líneas',
    overview: {
      desc: 'Dos fuentes, una plataforma y tres salidas. Los reportes de la app validan las alertas del collar, y esas alertas confirmadas sirven para entrenar el modelo.',
      facts: [['Fuentes', 'App de registro y collar'], ['Plataforma', 'Una'], ['Salidas', 'Mapa, panel y alertas']],
    },
    steps: [
      {
        title: 'Alerta pendiente',
        subtitle: 'Llega una alerta del collar',
        etapa: 2,
        show: ['gateway', 'internet', 'plataforma'],
        badges: { plataforma: { text: 'ALERTA PENDIENTE', tone: 'warn', after: 2.4 } },
        desc: 'El gateway de un predio reenvía una alerta de rebaño. La plataforma la guarda como pendiente: todavía nadie ha visto qué pasó.',
        facts: [['Estado', 'Pendiente'], ['Fuente', 'Collar']],
        packets: [
          { at: 0.3, path: ['gateway', 'internet', 'plataforma'], kind: 'https', label: 'ALERTA REBAÑO', info: '3/5 · sector S-14', proto: 'HTTPS', size: '1,1 KB', time: '03:41:14.600', seen: 'Visto entre el gateway y la plataforma', detail: web({ appSize: 860, json: { tipo: 'alerta_rebano', predio: 'P-0281', reaccionan: '3/5', sector: 'S-14', estado: 'pendiente' }, fields: [{ layer: 'app', name: 'estado', key: 'estado', value: 'pendiente', note: 'Espera confirmación en terreno.' }] }) },
        ],
      },
      {
        title: 'Confirmación en terreno',
        subtitle: 'El productor registra lo que encontró',
        etapa: 0,
        show: ['gateway', 'internet', 'plataforma', 'app', 'torre'],
        badges: { plataforma: { text: 'ALERTA PENDIENTE', tone: 'warn' } },
        desc: 'Al llegar al potrero, el productor registra lo que encontró. La app y el collar describen el mismo evento desde dos fuentes distintas.',
        facts: [['Fuente', 'App de registro'], ['Hallazgo', '1 oveja muerta']],
        packets: [
          { at: 0.3, path: ['app', 'torre', 'internet', 'plataforma'], kind: 'https', label: 'REGISTRO', info: 'ataque confirmado · 1 muerta', proto: 'HTTPS', size: '980 KB', time: '04:05:31.020', seen: 'Visto entre el celular y la plataforma', detail: web({ appSize: 980, json: { evento: 'ataque', vinculado_a: 'alerta P-0281 03:41', muertos: 1, heridos: 2, especie: 'ovino' }, fields: [{ layer: 'app', name: 'vinculado_a', key: 'vinculado_a', value: 'alerta 03:41', note: 'La app propone vincular el registro con la alerta reciente.', ex: true }, { layer: 'app', name: 'muertos', key: 'muertos', value: '1', note: 'Pérdida confirmada en terreno.', ex: true }] }) },
        ],
      },
      {
        title: 'Fusión de fuentes',
        subtitle: 'La app valida al collar',
        etapa: 2,
        show: ['gateway', 'internet', 'plataforma', 'app', 'torre'],
        badges: { plataforma: { text: 'CONFIRMADA', tone: 'ok' } },
        overlay: { type: 'merge' },
        hold: 5.5,
        desc: 'La plataforma cruza hora y sector: el reporte de la app confirma la alerta del collar. Hoy no existen datos de ataques reales para entrenar el modelo; cada alerta confirmada se suma a ese conjunto.',
        facts: [['Cruce', 'Hora + sector'], ['Uso', 'Entrenar el modelo del collar']],
      },
      {
        title: 'Al mapa',
        subtitle: 'Un evento confirmado, no dos',
        etapa: 3,
        show: ['gateway', 'internet', 'plataforma', 'app', 'torre', 'mapa'],
        badges: { plataforma: { text: 'CONFIRMADA', tone: 'ok' } },
        overlay: { type: 'map', mode: 'grid', highlight: 14 },
        desc: 'El mapa suma un solo evento confirmado en el sector, sin contar dos veces el mismo ataque.',
        facts: [['Eventos sumados', '1'], ['Sector', 'S-14']],
        packets: [
          { at: 0.3, path: ['plataforma', 'mapa'], kind: 'datos', label: 'SECTOR', info: 'S-14 · +1 confirmado', proto: 'Teselas', size: '3,4 KB', time: '04:05:32.400', seen: 'Visto entre la plataforma y el mapa', detail: web({ appSize: 3400, note: 'Datos ya agregados por sector.', json: { sector: 'S-14', eventos_30d: 5, confirmados_por_app: 3, nivel: 'alto' }, fields: [{ layer: 'app', name: 'confirmados_por_app', key: 'confirmados_por_app', value: '3', note: 'Cuántos eventos tienen doble fuente.', ex: true }] }) },
        ],
      },
    ],
    summary: {
      title: 'Dos fuentes, un evento',
      subtitle: 'La app valida al collar',
      desc: 'La alerta del collar quedó confirmada por el registro del productor y el mapa la contó una sola vez. Pulsa REPETIR para verlo de nuevo.',
      facts: [['Fuentes', '2'], ['Plataforma', '1'], ['Salidas', '3']],
    },
  },

  {
    id: 'mapa',
    cat: 'datos',
    title: 'Mapa de riesgo',
    subtitle: 'Focos por sector, sin exponer predios',
    overview: {
      desc: 'Los registros se convierten en mapas de riesgo para la provincia. El problema es territorial, no predial: los datos sirven cuando se comparten entre vecinos y autoridades, sin exponer a nadie.',
      facts: [['Para quién', 'Productores, GTT'], ['Muestra', 'Focos y su evolución por sector'], ['Privacidad', 'Nunca el predio exacto de otro']],
    },
    steps: [
      {
        title: 'Puntos exactos',
        subtitle: 'Solo dentro de la base',
        etapa: 2,
        show: ['plataforma'],
        overlay: { type: 'map', mode: 'points' },
        hold: 5,
        desc: 'La base guarda la coordenada exacta de cada registro. Ese nivel de detalle solo lo ven el propio productor y el equipo autorizado.',
        facts: [['Detalle', 'Coordenada exacta'], ['Acceso', 'Productor y equipo autorizado']],
      },
      {
        title: 'Agregación',
        subtitle: 'Los puntos se agrupan en sectores',
        etapa: 2,
        show: ['plataforma'],
        overlay: { type: 'map', mode: 'grid' },
        hold: 5,
        desc: 'Para el mapa compartido, los puntos se cuentan por sector. Los vecinos ven zonas agregadas, nunca el predio exacto de otro.',
        facts: [['Unidad', 'Sector'], ['Se pierde', 'La ubicación del predio']],
      },
      {
        title: 'Publicación',
        subtitle: 'El productor recibe algo a cambio',
        etapa: 3,
        show: ['plataforma', 'mapa'],
        overlay: { type: 'map', mode: 'grid', highlight: 14 },
        desc: 'El mapa muestra los focos y su evolución. En Australia Meridional los predios que reportaban bajaron de 38 % a 11 % en un año: el reporte decae si no devuelve valor, por eso el productor recibe alertas de su sector.',
        facts: [['Lección', 'El reporte debe devolver valor'], ['A cambio', 'Alertas del sector y respaldo']],
        packets: [
          { at: 0.3, path: ['plataforma', 'mapa'], kind: 'datos', label: 'MAPA', info: 'focos por sector · 30 días', proto: 'Teselas', size: '48 KB', time: '06:00:00.000', seen: 'Visto entre la plataforma y el mapa', detail: web({ appSize: 4800, note: 'Teselas agregadas: ningún campo identifica un predio.', json: { periodo: '30d', sectores: 24, con_eventos: 9, foco_principal: 'S-14' }, fields: [{ layer: 'app', name: 'sectores', key: 'sectores', value: '24', note: 'Cuadrícula del mapa.', ex: true }, { layer: 'app', name: 'foco_principal', key: 'foco_principal', value: 'S-14', note: 'Sector con más eventos recientes.', ex: true }] }) },
        ],
      },
    ],
    summary: {
      title: 'Mapa compartido',
      subtitle: 'Útil para todos, sin exponer a nadie',
      desc: 'Los registros individuales se transformaron en focos por sector. Pulsa REPETIR para verlo de nuevo.',
      facts: [['Vecinos ven', 'Sectores'], ['Base guarda', 'Coordenadas exactas'], ['Lección australiana', '38 % → 11 % si no hay retorno']],
    },
  },

  {
    id: 'panel',
    cat: 'datos',
    title: 'Panel de análisis',
    subtitle: 'INIA, SAG y municipios',
    overview: {
      desc: 'INIA y las autoridades ven el mismo dato agregado: cuántos eventos hubo, dónde se concentran y cuántos predios participan. Con eso se puede saber si una medida de control funcionó.',
      facts: [['Para quién', 'INIA, SAG, municipios'], ['Entrega', 'Cifras por comuna y temporada'], ['Exportación', 'API y CSV']],
    },
    steps: [
      {
        title: 'Consulta',
        subtitle: 'El panel pide indicadores',
        etapa: 3,
        show: ['panel', 'plataforma'],
        desc: 'Un analista de INIA abre el panel y filtra por temporada. El panel pide los indicadores a la plataforma.',
        facts: [['Filtro', 'Temporada 2026'], ['Nivel', 'Comuna']],
        packets: [
          { at: 0.3, path: ['panel', 'plataforma'], kind: 'datos', label: 'CONSULTA', info: 'GET /indicadores?temporada=2026', proto: 'HTTPS', size: '310 B', time: '10:12:40.000', seen: 'Visto entre el panel y la plataforma', detail: web({ appSize: 120, json: { temporada: 2026, nivel: 'comuna', provincia: 'Osorno' }, fields: [{ layer: 'app', name: 'nivel', key: 'nivel', value: 'comuna', note: 'Las autoridades trabajan con datos agregados.' }] }) },
        ],
      },
      {
        title: 'Indicadores',
        subtitle: 'Eventos, predios y pérdidas',
        etapa: 3,
        show: ['panel', 'plataforma'],
        overlay: { type: 'panel' },
        hold: 5.5,
        desc: 'La plataforma responde con cifras por comuna y temporada, pérdidas estimadas y participación. Los datos de esta vista son de ejemplo.',
        facts: [['Indicadores', 'Eventos, predios, pérdidas'], ['Datos', 'De ejemplo']],
        packets: [
          { at: 0.3, path: ['plataforma', 'panel'], kind: 'datos', label: 'INDICADORES', info: '5 comunas · temporada 2026', proto: 'HTTPS', size: '6,8 KB', time: '10:12:40.380', seen: 'Visto entre la plataforma y el panel', detail: web({ appSize: 6800, json: { eventos: 128, predios_que_reportan: 41, animales_muertos: 63, abortos: 12, comuna_mas_afectada: 'Purranque' }, fields: [{ layer: 'app', name: 'eventos', key: 'eventos', value: '128', note: 'Total de la temporada.', ex: true }, { layer: 'app', name: 'predios_que_reportan', key: 'predios_que_reportan', value: '41', note: 'Participación: clave para saber si el sistema se sostiene.', ex: true }, { layer: 'app', name: 'abortos', key: 'abortos', value: '12', note: 'Si se incluyen abortos (y Neospora) lo decide el equipo veterinario.', ex: true }] }) },
        ],
      },
      {
        title: 'Exportación',
        subtitle: 'Datos para investigación',
        etapa: 3,
        show: ['panel', 'plataforma'],
        desc: 'Los datos se exportan por API o CSV para investigación. Quién es dueño de los datos y bajo qué condiciones se comparten es una de las preguntas por definir con INIA.',
        facts: [['Formatos', 'API · CSV'], ['Pendiente', 'Propiedad de los datos']],
        packets: [
          { at: 0.3, path: ['plataforma', 'panel'], kind: 'datos', label: 'CSV', info: 'eventos_2026.csv', proto: 'HTTPS', size: '84 KB', time: '10:14:02.550', seen: 'Visto entre la plataforma y el panel', detail: web({ appSize: 8400, json: { archivo: 'eventos_2026.csv', columnas: ['fecha', 'comuna', 'sector', 'especie', 'muertos', 'heridos', 'abortos', 'con_dueno'], filas: 128 }, fields: [{ layer: 'app', name: 'columnas', key: 'columnas', value: '8', note: 'Sin coordenadas exactas ni nombres de predios.', ex: true }] }) },
        ],
      },
    ],
    summary: {
      title: 'Datos para decidir',
      subtitle: 'Medir si una medida funcionó',
      desc: 'Las autoridades vieron cifras por comuna y exportaron los datos. Pulsa REPETIR para verlo de nuevo.',
      facts: [['Para', 'INIA, SAG, municipios'], ['Formatos', 'Panel, API, CSV'], ['Contexto', 'Proyectos de ley sobre perros asilvestrados en votación']],
    },
  },
]

// ---------- tiempos ----------
export const HOP = 1.15 // segundos por salto a 1×

export function packetEnd(p) {
  const hops = p.fail != null ? p.fail + 0.55 : p.path.length - 1
  return p.at + hops * HOP
}

export function stepDuration(step) {
  const ends = (step.packets ?? []).map((p) => packetEnd(p) + 0.9)
  return Math.max(step.hold ?? 0, 3.4, ...ends)
}

// Numeración global de paquetes dentro de cada escenario
for (const sc of SCENARIOS) {
  let n = 0
  sc.steps.forEach((st, si) => {
    ;(st.packets ?? []).forEach((p) => {
      n += 1
      p.n = n
      p.step = si
      p.src = p.path[0]
      p.dst = p.path[p.path.length - 1]
    })
  })
  sc.packetCount = n
  sc.allPackets = sc.steps.flatMap((s) => s.packets ?? [])
  sc.nodes = [...new Set(sc.steps.flatMap((s) => s.show))]
}
