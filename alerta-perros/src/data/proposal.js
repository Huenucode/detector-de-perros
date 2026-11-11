// Contenido de la propuesta (fuente: "Propuesta: registro, mapeo y alerta temprana de ataques de perros asilvestrados").
export const PROPOSAL = {
  title: 'Registro, mapeo y alerta temprana de ataques de perros asilvestrados',
  partner: 'Propuesta para INIA Remehue',
  problema: {
    lead: 'Los ataques de perros a ovinos y bovinos en Los Lagos se conocen por relatos y notas de prensa, no por datos. Sin un registro común no se puede saber dónde se concentran, cuánto cuestan ni si una medida de control funcionó.',
    items: [
      { k: 'Daño directo', v: 'En las provincias de Osorno y Llanquihue hay ataques documentados, como 8 terneros heridos en Purranque y 5 vacunos muertos en Llanquihue.' },
      { k: 'Abortos', v: 'El equipo veterinario de INIA Remehue observa abortos en vacas asociados a estos ataques. El perro es hospedero definitivo de Neospora caninum, causa importante de aborto en ganado lechero. Si este vínculo entra en el alcance lo decide el equipo veterinario.' },
      { k: 'Momento oportuno', v: 'El Congreso vota en particular los proyectos refundidos sobre perros asilvestrados (boletines 16962-01, 18269-01 y 18400-01). Cualquier medida necesitará datos territoriales para aplicarse y evaluarse.' },
    ],
    stats: [
      { n: 8, label: 'terneros heridos', place: 'Purranque' },
      { n: 5, label: 'vacunos muertos', place: 'Llanquihue' },
      { n: 3, label: 'boletines en el Congreso', place: 'proyectos refundidos' },
    ],
  },
  componentes: [
    { name: 'App de registro', what: 'Captura en menos de un minuto: foto, ubicación, especie afectada, animales muertos, heridos o abortos, y si los perros parecían tener dueño. Funciona sin señal y sincroniza después.', who: 'Productores, veterinarios, asesores' },
    { name: 'Mapa de riesgo', what: 'Muestra focos y su evolución por sector. Los vecinos ven zonas agregadas, nunca el predio exacto de otro.', who: 'Productores, GTT' },
    { name: 'Panel de análisis', what: 'Entrega cifras por comuna y temporada, pérdidas estimadas y exportación de datos para investigación.', who: 'INIA, SAG, municipios' },
  ],
  collar: [
    { k: 'Qué se ha probado', v: 'En Suiza, un collar midió que el pulso de las ovejas saltó de 60–80 a 225 latidos por minuto en un ataque simulado. En Australia, sensores en ovejas mostraron cambios de movimiento con perros presentes.' },
    { k: 'Cómo funcionaría', v: 'Un acelerómetro detecta la huida, el collar clasifica el evento y lo envía por radio LoRa a un receptor en el predio. La alarma se activa solo si varios animales reaccionan a la vez.' },
    { k: 'Cómo se mantiene barato', v: 'Collar solo en animales centinela (10 % a 20 % del rebaño) y GPS encendido solo durante un evento. Un diseño GPS/LoRa publicado cuesta cerca de US$65 por unidad en lotes de 100.' },
    { k: 'Por dónde partir', v: 'Ovinos primero, con 5 a 10 collares en un rebaño de Remehue. El bovino reacciona distinto y requiere un modelo propio.' },
  ],
  riesgos: [
    { r: 'No existen datos de ataques para entrenar el modelo', a: 'Simulaciones con perros de trabajo bajo supervisión veterinaria, más los reportes de la app' },
    { r: 'Falsas alarmas por arreos, tormentas o perros del predio', a: 'Decisión a nivel de rebaño y ajuste con datos del piloto' },
    { r: 'Durabilidad en barro y lluvia, y autonomía de la batería', a: 'Pruebas de terreno de varias semanas antes de escalar' },
  ],
  lecciones: [
    { k: 'El reporte decae si no devuelve valor', v: 'En Australia Meridional los predios que reportaban bajaron de 38 % a 11 % en un año. El productor debe recibir algo a cambio: alertas de su sector y un respaldo de sus pérdidas.', from: 38, to: 11 },
    { k: 'El problema es territorial, no predial', v: 'Perros con collar GPS en Nueva Gales del Sur recorrieron en promedio 630 km². Los datos sirven cuando se comparten entre vecinos y autoridades.', km: 630 },
    { k: 'No todos los perros son asilvestrados', v: 'Especialistas chilenos advierten que los perros con dueño que deambulan también atacan ganado. Registrar esa diferencia orienta la medida correcta.' },
  ],
  piloto: [
    { n: 1, name: 'Levantamiento', dur: '3 a 4 semanas', weeks: [3, 4], v: 'Definir con el equipo veterinario qué datos registrar y revisar los registros que ya existen.' },
    { n: 2, name: 'Prototipo', dur: '6 a 8 semanas', weeks: [6, 8], v: 'App de registro y mapa básico, probados con el equipo de INIA.' },
    { n: 3, name: 'Piloto en terreno', dur: '6 a 8 semanas', weeks: [6, 8], v: 'Uso real con 10 a 20 productores, idealmente de un GTT vinculado a Remehue. En paralelo, primer prototipo de 5 a 10 collares en ovinos.' },
    { n: 4, name: 'Evaluación', dur: 'al cierre', weeks: [1, 1], v: 'Medir cuántos reportan, qué muestran los datos y decidir si se escala.' },
  ],
  aportes: {
    inia: ['Criterio veterinario y validación de los datos', 'Vínculo con productores y GTT', 'Registros históricos disponibles'],
    equipo: ['Diseño, desarrollo y operación de la plataforma', 'Capacitación y soporte a los usuarios del piloto', 'Análisis de datos y reportes'],
  },
  preguntas: [
    '¿Cómo se registran hoy los ataques y abortos, y qué datos históricos existen?',
    '¿Se incluye el seguimiento de abortos y Neospora, o el piloto parte solo con ataques?',
    '¿Quién usará la información (INIA, SAG, municipios) y para qué decisión?',
    '¿Qué grupo de productores podría participar en el piloto?',
    '¿Quién es dueño de los datos y bajo qué condiciones se comparten?',
    '¿Hay interés en sumar estudiantes de INACAP Osorno y en postular a fondos (FIA, FNDR, CORFO)?',
    '¿Puede Remehue facilitar un rebaño ovino y supervisión veterinaria para las pruebas del collar?',
  ],
}
