# Null Client

Cliente / launcher de Minecraft estilo Lunar, hecho mientras aprendemos JavaScript, HTML, CSS y Electron.

## Versión 0.1 — ¿De qué trata?

La **0.1** es la primera versión usable del **launcher de escritorio con Electron**.
Ya abre una ventana fija de Windows, inicia sesión con una cuenta premium (Microsoft) y puede **lanzar Minecraft** online.

### Qué incluye la 0.1

- App Electron (titlebar propia: minimizar / cerrar, tamaño fijo)
- Marca **Null Client** + logo
- Selector de versiones (Fabric 1.21.11, 1.19.2, PvP 1.8.9) con última versión recordada
- Hero que cambia de imagen según la versión (fade + difuminado)
- Botón **PLAY / STOP** real (lanza y cierra el proceso del juego, con la sesión premium)
- Descarga del juego a `%AppData%\.nullclient`
- **Last Servers Played** detectados desde el juego (log + `servers.dat` + iconos), poll cada 15 s
- Panel de amigos (maqueta)
- Noticias en dos banners
- Carpeta `aprender/` con teoría y ejercicios de JS desde cero

### Qué viene después (ideas)

- Fabric / mods de verdad
- Perfiles, cosméticos, ajustes de RAM/Java en la UI
- Unir directo al server desde Last Servers sin bugs de instancia abierta

## Cómo abrir el launcher

El login premium lo resuelve la API de Null, en `https://null.sistemasjaihom.com`. Este repositorio no incluye la API ni la clave. En `launcher/` crea `null-api.local.json` con la URL y la clave que te dio el servidor; sin ese archivo el launcher no entra.

En una terminal, dentro de `launcher/`:

```powershell
npm install
npm start
```

Pulsa la cuenta abajo a la izquierda, entra con Microsoft (código en [microsoft.com/link](https://www.microsoft.com/link)) y luego PLAY. La cuenta tiene que tener Minecraft Java. La contraseña no pasa por la API: Microsoft la pide en su página.

También puedes abrir `launcher/index.html` en el navegador (solo UI; no lanza el juego ni inicia sesión).

## Estructura

| Carpeta / archivo | Contenido |
|-------------------|-----------|
| `launcher/` | App Electron (HTML, CSS, JS, main, preload) |
| `launcher/minecraft-launch.js` | Lanza Minecraft con MCLC, en online |
| `launcher/null-api.js` | Pide el login premium a la API de Null |
| `launcher/server-tracker.js` | Detecta últimos servers jugados |
| `aprender/` | Apuntes y ejercicios del aprendizaje |
