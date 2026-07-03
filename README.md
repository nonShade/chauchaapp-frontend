# ChauchaApp — Frontend

Aplicación móvil de educación financiera personal para usuarios chilenos. Desarrollada con **React Native + Expo**, disponible para Android e iOS.

ChauchaApp ayuda a los usuarios a entender y controlar su situación financiera: registro de ingresos y gastos, noticias económicas analizadas por IA según su perfil, tips financieros diarios y módulos de aprendizaje generados dinámicamente.

---

## Pantallas principales

La app tiene cuatro secciones accesibles desde el menú inferior:

| Sección | Descripción |
|---------|------------|
| **Inicio** | Resumen financiero del mes, acceso rápido a las funciones principales |
| **Cartola** | Historial de transacciones con filtros, registro de ingresos y gastos |
| **Noticias** | Noticias económicas chilenas analizadas por IA, contextualizadas al perfil del usuario |
| **Aprender** | Módulos de educación financiera con seguimiento de progreso y quizzes |

Además de las vistas principales, la app incluye pantallas para registro e inicio de sesión, detalle de módulo de aprendizaje, quiz evaluativo, perfil de usuario, notificaciones y gestión de grupo familiar.

---

## Stack tecnológico

| | Tecnología |
|-|-----------|
| Framework | React Native 0.81 + React 19 |
| Plataforma | Expo 54 (iOS / Android / Web) |
| Lenguaje | TypeScript 5.9 |
| Routing | Expo Router (file-based) |
| Navegación | React Navigation (bottom tabs) |
| Cliente HTTP | Axios con interceptores JWT |
| Almacenamiento seguro | Expo Secure Store |
| Animaciones | React Native Reanimated |
| Iconos | Lucide React Native + Expo Vector Icons |
| Notificaciones push | Expo Notifications |
| Gestos | React Native Gesture Handler |

---

## Estructura del proyecto

```
app/                            ← Rutas de la aplicación (Expo Router)
├── (tabs)/                     ← Navegación principal con bottom tabs
│   ├── index.tsx               ← Inicio
│   ├── wallet.tsx              ← Cartola / transacciones
│   ├── news.tsx                ← Noticias financieras
│   ├── learn.tsx               ← Módulos de aprendizaje
│   └── profile.tsx             ← Perfil de usuario
├── login.tsx
├── register.tsx
├── learn-detail.tsx            ← Detalle de un módulo
├── learn-quiz.tsx              ← Quiz de evaluación
├── new-transaction.tsx         ← Formulario de nueva transacción
└── notifications.tsx

components/                     ← Componentes reutilizables organizados por sección
services/
└── api/
    ├── apiClient.ts            ← Cliente Axios centralizado (auth, refresh, errores)
    ├── auth.ts
    ├── transactions.ts
    ├── news.ts
    ├── tips.ts
    ├── learnModules.ts
    ├── familyGroup.ts
    ├── financialPlanning.ts
    ├── groups.ts
    ├── notifications.ts
    └── userProfile.ts
contexts/
└── AuthContext.tsx             ← Estado global de sesión del usuario
constants/
└── themes.ts                   ← Sistema de diseño (colores, tipografía)
hooks/                          ← Custom hooks reutilizables
types/                          ← Tipos TypeScript compartidos entre módulos
```

---

## Inicio rápido

### Requisitos

- Node.js 20+
- npm
- Expo Go instalado en el dispositivo físico, o un emulador Android / simulador iOS configurado
- Backend de ChauchaApp corriendo ([ver repositorio del backend](../chauchaapp-backend))

### Instalación

```bash
npm install
```

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

Si se ejecuta desde un dispositivo físico, reemplazar `localhost` con la IP local de la máquina donde corre el backend:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.X:8000
```

### Levantar la app

```bash
npx expo start
```

Desde el servidor de Expo se puede abrir la app en:

- **Dispositivo físico** → Escanear el QR con Expo Go
- **Emulador Android** → Presionar `a`
- **Simulador iOS** → Presionar `i`
- **Navegador web** → Presionar `w`

---

## Autenticación

El flujo de autenticación está centralizado en dos archivos:

- **`contexts/AuthContext.tsx`** — Mantiene el estado de sesión (usuario autenticado, carga inicial, login/logout)
- **`services/api/apiClient.ts`** — Cliente HTTP compartido por todos los servicios

El cliente maneja automáticamente la renovación de tokens:
1. Si una petición recibe un `401`, intenta obtener un nuevo access token usando el refresh token almacenado
2. Si la renovación tiene éxito, reintenta la petición original con el nuevo token
3. Si la renovación falla (refresh token expirado o inválido), elimina ambos tokens y redirige al login

Los tokens se almacenan en `expo-secure-store`, que usa almacenamiento cifrado provisto por el sistema operativo del dispositivo (Keychain en iOS, EncryptedSharedPreferences en Android).

---

## Operaciones asíncronas con el backend

Algunas operaciones como la generación de noticias analizadas o los módulos de educación son procesadas por agentes de IA en el backend y pueden tardar varios segundos. Para estos casos, el backend expone un sistema de tareas:

1. Se hace `POST` para iniciar la operación → se recibe un `task_id`
2. Se consulta periódicamente `GET /tasks/{task_id}` hasta que el estado sea `completed` o `failed`

El servicio `services/api/asyncTask.ts` encapsula este patrón de polling para que los componentes no lo manejen directamente.

---

## Sistema de diseño

Los colores, tipografía y estilos base están definidos en `constants/themes.ts` bajo el objeto `APP_THEME`. La app usa un tema oscuro por defecto.

Para mantener consistencia visual, todos los componentes deben referenciar `APP_THEME` en lugar de hardcodear colores. El objeto está organizado por categorías:

```typescript
APP_THEME.background    // fondos de pantalla
APP_THEME.card          // fondos y bordes de tarjetas
APP_THEME.text          // colores de texto (primary, secondary, muted)
APP_THEME.button        // estilos de botones (primary, secondary)
APP_THEME.status        // colores semánticos (error, success, warning)
```

---

## Convenciones

- Las pantallas van en `app/`, los componentes reutilizables en `components/`
- Cada recurso del backend tiene su servicio en `services/api/` con funciones tipadas
- Los tipos compartidos entre servicios y componentes van en `types/`
- El routing es completamente file-based (Expo Router); no hay un archivo de rutas centralizado
