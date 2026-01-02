# Sistema de Estadísticas y Premios

Este documento explica el nuevo sistema de estadísticas por temporada y premios implementado en la aplicación.

## 📊 Estructura de Datos

### 1. Colección `BallonDeOroWinners`
Almacena los ganadores oficiales del Balón de Oro por año.

**Estructura del documento:**
```javascript
{
  year: 2025,              // Año del premio
  first: "playerId123",    // ID del ganador (Balón de Oro)
  second: "playerId456",   // ID del segundo lugar (Balón de Plata)
  third: "playerId789",    // ID del tercer lugar (Balón de Bronce)
  createdAt: Timestamp
}
```

**Nombre del documento:** El año en formato string (ej: "2025")

### 2. Colección `PlayerSeasonStats`
Estadísticas de cada jugador por temporada.

**Estructura del documento:**
```javascript
{
  playerId: "abc123",      // ID del jugador
  season: 2025,            // Año de la temporada
  goals: 15,               // Goles en la temporada
  assists: 8,              // Asistencias en la temporada
  matches: 25,             // Partidos jugados
  won: 15,                 // Partidos ganados
  draw: 5,                 // Partidos empatados
  lost: 5,                 // Partidos perdidos
  cleanSheets: 3,          // Porterías a cero (solo para porteros)
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Nombre del documento:** `{playerId}_{season}` (ej: "abc123_2025")

### 3. Modificación en colección `Players`
Se agregó un campo `awards` que es un array de objetos:

```javascript
{
  // ... campos existentes (name, goals, assists, etc.)
  awards: [
    {
      type: "ballonDeOro",
      position: 1,           // 1=Oro, 2=Plata, 3=Bronce
      award: "Balón de Oro", // Nombre del premio
      year: 2025
    }
  ]
}
```

## 🔧 Funciones Disponibles

### Funciones en `endpoints.js`

#### 1. `saveBallonDeOroWinners(year, first, second, third)`
Guarda los ganadores del Balón de Oro y actualiza sus perfiles.

```javascript
await saveBallonDeOroWinners(2025, "playerId1", "playerId2", "playerId3");
```

#### 2. `getBallonDeOroWinners(year)`
Obtiene los ganadores de un año específico.

```javascript
const winners = await getBallonDeOroWinners(2025);
```

#### 3. `getPlayerAwards(playerId)`
Obtiene todos los premios de un jugador.

```javascript
const awards = await getPlayerAwards("playerId123");
```

#### 4. `getPlayerSeasonStats(playerId, season)`
Obtiene o crea las estadísticas de una temporada para un jugador.

```javascript
const stats = await getPlayerSeasonStats("playerId123", 2025);
```

#### 5. `getAllPlayerSeasonStats(playerId)`
Obtiene todas las temporadas de un jugador ordenadas por año descendente.

```javascript
const allSeasons = await getAllPlayerSeasonStats("playerId123");
```

#### 6. `updatePlayerSeasonStatsAfterMatch(matchData)`
**Llamada automáticamente** después de cada partido registrado.
Actualiza las estadísticas de temporada y totales de todos los jugadores.

## 🎯 Flujo de Uso

### Registrar Ganadores del Balón de Oro

#### Opción 1: Desde la UI (Recomendado para Admins)
1. Ve a la página de resultados del Balón de Oro
2. Si eres admin, verás un botón "Registrar Ganadores Oficiales"
3. Haz clic y confirma los ganadores
4. El sistema automáticamente:
   - Guarda los ganadores en `BallonDeOroWinners`
   - Actualiza los perfiles de los 3 jugadores con sus premios

#### Opción 2: Programáticamente
```javascript
import { registerBallonDeOroWinners } from './utils/registerBallonDeOroWinners';
import { getBallonDeOroResults } from './firebase/endpoints';

// Obtener resultados de la votación
const results = await getBallonDeOroResults(2025);

// Crear ranking
const ranking = Object.entries(results.playerPoints)
  .map(([playerId, points]) => ({ playerId, points }))
  .sort((a, b) => b.points - a.points);

// Registrar los 3 primeros lugares
await registerBallonDeOroWinners(
  2025,
  ranking[0].playerId, // Oro
  ranking[1].playerId, // Plata
  ranking[2].playerId  // Bronce
);
```

### Actualización Automática de Estadísticas

Las estadísticas se actualizan **automáticamente** cada vez que se registra un nuevo partido mediante `saveNewMatch()`. No requiere acción manual.

El sistema actualiza:
- ✅ Estadísticas totales históricas en `Players`
- ✅ Estadísticas de la temporada actual en `PlayerSeasonStats`
- ✅ Stats de porteros (clean sheets)
- ✅ Resultados (victorias, empates, derrotas)

### Visualizar Estadísticas en el Perfil

Las estadísticas se muestran automáticamente en la página "Mi Perfil" (`/mi-perfil`):

1. **Premios**: Muestra todos los premios ganados con medallas
2. **Estadísticas Históricas**: Totales de toda la carrera
3. **Temporada Actual**: Stats del año en curso
4. **Historial por Temporadas**: Desglose año por año

## 🎨 Componentes UI

### `PlayerStatsCard`
Componente reutilizable que muestra las estadísticas y premios de un jugador.

**Props:**
- `playerData`: Objeto del jugador con stats totales
- `seasonStats`: Array de estadísticas por temporada
- `awards`: Array de premios del jugador

**Ejemplo de uso:**
```jsx
<PlayerStatsCard 
  playerData={playerData} 
  seasonStats={seasonStats}
  awards={awards}
/>
```

## 📱 Páginas Modificadas

### `MiPerfilPage.jsx`
- Muestra información personal del jugador
- Integra `PlayerStatsCard` para mostrar estadísticas y premios
- Carga automáticamente awards y season stats

### `BallonDeOroResults.jsx`
- Muestra resultados de la votación
- Botón de admin para registrar ganadores oficiales
- Dialog de confirmación antes de guardar
- Indicador si los ganadores ya fueron registrados

## 🔐 Permisos

- **Registro de ganadores**: Solo admins
- **Visualización de stats**: Todos los usuarios pueden ver sus propias stats
- **Actualización automática**: Se ejecuta con cada partido nuevo

## 🚀 Próximas Mejoras Sugeridas

1. **Dashboard de temporada**: Página con stats agregadas de toda la temporada
2. **Comparación de jugadores**: Comparar stats entre jugadores
3. **Más premios**: Goleador, mejor asistente, mejor portero, etc.
4. **Gráficas**: Visualización de progreso por temporada
5. **Exportar datos**: Descargar estadísticas en CSV/PDF

## ⚠️ Notas Importantes

- Las estadísticas por temporada se crean automáticamente al registrar el primer partido del año
- Los premios solo se agregan cuando se ejecuta `saveBallonDeOroWinners()`
- Una vez registrados los ganadores de un año, aparecerá un indicador y no se podrá volver a guardar
- Las estadísticas históricas en `Players` se mantienen para compatibilidad con código existente

## 🐛 Troubleshooting

**Problema**: Las estadísticas no se actualizan después de un partido
- **Solución**: Verifica que `updatePlayerSeasonStatsAfterMatch()` esté siendo llamada en `saveNewMatch()`

**Problema**: Los premios no aparecen en el perfil
- **Solución**: Asegúrate de que se ejecutó `saveBallonDeOroWinners()` para ese año

**Problema**: Error al cargar estadísticas de temporada
- **Solución**: Los documentos se crean automáticamente. Si hay error, verifica los permisos de Firestore.
