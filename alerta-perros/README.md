# Alerta Rural Explorer

Explorador interactivo de la propuesta **"Registro, mapeo y alerta temprana de ataques de perros asilvestrados"** (INIA Remehue).
Muestra, paso a paso y byte a byte, cómo viaja cada registro de la app y cada alerta del collar LoRa hasta el mapa de riesgo y el panel de análisis.

Inspirado en el estilo de *Protocol Explorer*: lienzo isométrico, paquetes animados, vista de secuencia, tabla de flujo e inspector de bytes.

## Requisitos

- Node.js 20 o superior (`node -v`)

## Correr en localhost

```bash
npm install
npm run dev
```

Se abre en <http://localhost:5173>.

## Generar la versión final

```bash
npm run build     # crea la carpeta dist/
npm run preview   # la sirve en http://localhost:4173 para revisarla
```

## Publicar en Vercel

**Opción A: desde GitHub (recomendada)**

1. Sube esta carpeta a un repositorio de GitHub (sin `node_modules` ni `dist`).
2. En <https://vercel.com/new> importa el repositorio.
3. Vercel detecta **Vite** solo. Deja los valores por defecto:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Pulsa **Deploy**.

**Opción B: desde la terminal**

```bash
npm i -g vercel
vercel          # primera vez: responde las preguntas (acepta los valores sugeridos)
vercel --prod   # publica en producción
```

## Estructura

```
src/
  data/scenarios.js   7 escenarios: pasos, paquetes y textos
  data/proposal.js    contenido de la propuesta (panel "PROPUESTA")
  data/nodes.js       posición de cada dispositivo en el lienzo
  lib/payload.js      arma las tramas LoRaWAN de ejemplo byte por byte
  components/         lienzo, dispositivos isométricos, inspector, tabla, etc.
public/fonts/         fuente Iosevka (subconjunto latino)
```

Para cambiar textos o agregar un escenario, edita `src/data/scenarios.js`.

## Atajos

| Tecla | Acción |
|---|---|
| Espacio | Reproducir / pausa |
| → / ← | Paso siguiente / anterior |
| R | Reiniciar |
| S | Alternar vista red / secuencia |
| Ctrl K | Buscar escenarios |

Los valores marcados **EJ.** son ilustrativos; las cifras del panel son ficticias.
