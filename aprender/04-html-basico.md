# Lección 3B — HTML básico (pantalla del launcher)

Hasta ahora el launcher vivía en la **terminal**.
Ahora empezamos la **ventana visual**: HTML = la estructura de lo que se ve.

Sin CSS todavía (colores/diseño vienen después).
Sin JavaScript en el navegador todavía.

---

## 1. ¿Qué es HTML?

**HTML** describe **qué hay** en la página:

- un título
- un párrafo
- un botón
- etc.

No “hace” lógica (eso es JS). Solo arma el esqueleto.

---

## 2. Anatomía mínima de una página

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Null Client</title>
  </head>
  <body>
    <h1>Null Client</h1>
    <p>Jugador: MrPerff</p>
    <button>Play</button>
  </body>
</html>
```

| Parte | Para qué |
|-------|----------|
| `<!DOCTYPE html>` | Dice “esto es HTML5” |
| `<html>` | Raíz de toda la página |
| `<head>` | Datos internos (título de la pestaña, etc.) |
| `<title>` | Texto de la pestaña del navegador |
| `<body>` | **Lo visible** en la página |

---

## 3. Etiquetas que usarás ya

Las etiquetas casi siempre vienen en pares: apertura y cierre.

```html
<h1>Título grande</h1>
<p>Un párrafo de texto</p>
<button>Play</button>
```

| Etiqueta | Significado |
|----------|-------------|
| `h1` | Título principal (solo uno por página, idealmente) |
| `h2` | Subtítulo |
| `p` | Párrafo |
| `button` | Botón |
| `div` | Caja genérica para agrupar cosas |

---

## 4. Cómo ver tu HTML

No uses `node` para esto.

1. Abre el archivo `.html` en el Explorador de Windows, **o**
2. En Cursor: clic derecho al archivo → **Open with Live Preview** / ábrelo en el navegador, **o**
3. Arrástralo a Chrome/Edge

Deberías ver título, texto y un botón (aunque feo: eso es normal sin CSS).

---

## 5. Tu ejercicio

Archivo: `aprender/ejercicios/06-launcher.html`

Completa los TODO para que la página muestre:

- Título de tu cliente
- Versión
- Nombre del jugador
- Un botón que diga **Play**

Cuando lo veas en el navegador, escribe **listo B**.
