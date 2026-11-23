# Null Client

Cliente / launcher de Minecraft estilo Lunar, hecho mientras aprendemos JavaScript, HTML y CSS.

## Versión 0.1 — ¿De qué trata?

La **0.1** es la primera versión usable del **launcher de escritorio (prototipo en navegador)**.

Todavía **no** lanza Minecraft de verdad ni incluye el cliente del juego.
Sirve como base visual y de aprendizaje.

### Qué incluye la 0.1

- Ventana del launcher (titlebar, sidebar, centro, amigos)
- Marca **Null Client** + logo
- Selector de versiones (Fabric 1.21.11, 1.19.2, PvP 1.8.9)
- Hero que cambia de imagen según la versión (con fade y difuminado)
- Botón PLAY con simulación de carga
- Lista de “últimos servidores” en grilla 2×2
- Panel de amigos (maqueta)
- Carpeta `aprender/` con teoría y ejercicios de JS desde cero

### Qué viene después (ideas)

- Guardar ajustes (`localStorage`)
- Electron (ventana real de Windows)
- Lanzar Minecraft de verdad
- Perfiles, mods del launcher, cosméticos, etc.

## Cómo abrir el launcher

1. Entra a la carpeta `launcher/`
2. Abre `index.html` en el navegador

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `launcher/` | App del launcher (HTML, CSS, JS, assets) |
| `aprender/` | Apuntes y ejercicios del aprendizaje |
