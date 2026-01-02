# Configuración de Firestore - Nuevas Colecciones

## 📋 Colecciones a Crear

### 1. BallonDeOroWinners
No requiere creación manual. Se crea automáticamente al guardar el primer ganador.

**Reglas de seguridad sugeridas:**
```javascript
match /BallonDeOroWinners/{year} {
  // Todos pueden leer
  allow read: if true;
  // Solo admins pueden escribir
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.role == "admin";
}
```

### 2. PlayerSeasonStats
No requiere creación manual. Se crea automáticamente al registrar partidos.

**Reglas de seguridad sugeridas:**
```javascript
match /PlayerSeasonStats/{statId} {
  // Todos pueden leer
  allow read: if true;
  // Solo el sistema puede escribir (desde cloud functions o admins)
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.role == "admin";
}
```

## 🔄 Migración de Datos Existentes (Opcional)

Si deseas poblar las estadísticas por temporada con datos históricos:

### Script de Migración

```javascript
import { getAllMatches, getAllPlayers, updatePlayerSeasonStatsAfterMatch } from './firebase/endpoints';

async function migrateHistoricalData() {
  console.log("🔄 Iniciando migración de datos históricos...");
  
  // 1. Obtener todos los partidos
  const matches = [];
  await getAllMatches((data) => {
    matches.push(...data);
  });
  
  console.log(`📊 Encontrados ${matches.length} partidos`);
  
  // 2. Procesar cada partido
  for (const match of matches) {
    try {
      console.log(`Procesando partido: ${match.id}`);
      await updatePlayerSeasonStatsAfterMatch(match);
    } catch (error) {
      console.error(`Error en partido ${match.id}:`, error);
    }
  }
  
  console.log("✅ Migración completada");
}

// Ejecutar migración (solo una vez)
// migrateHistoricalData();
```

⚠️ **IMPORTANTE**: 
- Ejecutar este script solo UNA VEZ
- Asegúrate de tener backup de tu base de datos
- Puede tomar varios minutos dependiendo del número de partidos

## 📝 Actualizar Campo `awards` en Players

Los jugadores existentes no tienen el campo `awards`. Se creará automáticamente cuando se registren ganadores del Balón de Oro.

Si deseas agregar el campo manualmente:

```javascript
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

async function addAwardsFieldToPlayers(playerIds) {
  for (const playerId of playerIds) {
    const playerRef = doc(db, "Players", playerId);
    await updateDoc(playerRef, {
      awards: []
    });
  }
}
```

## 🎯 Pasos Inmediatos Después de Deploy

1. **Verificar Reglas de Firestore**: Asegúrate de que las reglas permitan la lectura/escritura según lo especificado arriba

2. **Registrar Ganadores 2025**: 
   - Ve a `/balon-de-oro-results`
   - Como admin, haz clic en "Registrar Ganadores Oficiales"
   - Confirma los ganadores

3. **Probar Perfil**:
   - Ve a `/mi-perfil`
   - Verifica que se muestren las estadísticas correctamente

4. **Registrar Nuevo Partido**:
   - Agrega un partido de prueba
   - Verifica que las stats se actualicen automáticamente
   - Revisa en Firestore que se creó el documento en `PlayerSeasonStats`

## 🔍 Verificación en Firestore Console

Después de registrar ganadores y un partido, deberías ver:

### BallonDeOroWinners/2025
```
{
  year: 2025,
  first: "xxx",
  second: "yyy", 
  third: "zzz",
  createdAt: Timestamp
}
```

### PlayerSeasonStats/{playerId}_2025
```
{
  playerId: "xxx",
  season: 2025,
  goals: 2,
  assists: 1,
  matches: 1,
  won: 1,
  draw: 0,
  lost: 0,
  cleanSheets: 0,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Players/{playerId} - Campo awards
```
{
  // ... campos existentes
  awards: [
    {
      type: "ballonDeOro",
      position: 1,
      award: "Balón de Oro",
      year: 2025
    }
  ]
}
```

## 📊 Índices Recomendados

Para optimizar las queries, crea estos índices en Firestore:

1. **PlayerSeasonStats**
   - Campo: `playerId` (Ascending)
   - Campo: `season` (Descending)

2. **BallonDeOroWinners**
   - Campo: `year` (Descending)

Estos índices se pueden crear automáticamente cuando Firestore te lo solicite, o manualmente desde la consola.

## 🧪 Testing

Checklist de pruebas:

- [ ] Registrar ganadores del Balón de Oro 2025
- [ ] Verificar que aparezcan en los perfiles de los ganadores
- [ ] Registrar un nuevo partido
- [ ] Verificar que se actualicen las stats totales
- [ ] Verificar que se creen/actualicen las stats de temporada
- [ ] Entrar al perfil y ver premios
- [ ] Ver estadísticas históricas
- [ ] Ver estadísticas de temporada actual
- [ ] Ver historial por temporadas

## ⚡ Performance

El sistema está optimizado para:
- ✅ Escrituras mínimas por partido (una por jugador en PlayerSeasonStats)
- ✅ Lecturas eficientes (queries por playerId)
- ✅ Índices apropiados
- ✅ Datos pre-calculados (no requiere agregaciones en tiempo real)

Las estadísticas se calculan al momento de guardar el partido, no cuando el usuario consulta su perfil.
