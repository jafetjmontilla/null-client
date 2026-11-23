# Lección 5 — CSS básico (darle cara al launcher)

HTML = estructura  
JS = comportamiento  
**CSS = apariencia** (colores, tamaños, espacios)

---

## 1. ¿Qué es CSS?

CSS son **reglas** del estilo:

> “Todos los `h1` van en blanco y más grandes.”  
> “El botón Play tiene fondo verde.”

---

## 2. Cómo se conecta al HTML

En el `<head>`:

```html
<link rel="stylesheet" href="08-launcher.css" />
```

---

## 3. Anatomía de una regla

```css
h1 {
  color: white;
  font-size: 32px;
}
```

| Parte | Significado |
|-------|-------------|
| `h1` | **Selector**: a qué elementos aplica |
| `{ }` | Bloque de estilos |
| `color` | **Propiedad** |
| `white` | **Valor** |
| `;` | Cierra cada declaración |

---

## 4. Selectores que usarás ya

```css
body { }           /* todas las etiquetas body */
h1 { }             /* todos los h1 */
button { }         /* todos los botones */
#estado { }        /* el elemento con id="estado" */
.tarjeta { }       /* elementos con class="tarjeta" */
```

- `id` → `#nombre` (uno solo)
- `class` → `.nombre` (puedes repetirla en varios elementos)

---

## 5. Propiedades útiles para empezar

| Propiedad | Ejemplo | Efecto |
|-----------|---------|--------|
| `color` | `color: white;` | Color del texto |
| `background-color` | `background-color: #1a1a1a;` | Color de fondo |
| `font-size` | `font-size: 18px;` | Tamaño del texto |
| `font-family` | `font-family: Arial, sans-serif;` | Tipo de letra |
| `padding` | `padding: 12px;` | Espacio **dentro** del elemento |
| `margin` | `margin: 8px;` | Espacio **fuera** del elemento |
| `border` | `border: none;` | Borde |
| `border-radius` | `border-radius: 8px;` | Esquinas redondeadas |
| `text-align` | `text-align: center;` | Alinear texto |

Los colores pueden ser nombres (`white`) o hex (`#00ff88`).

---

## 6. Cómo probar

1. Completa los TODO de `08-launcher.html` y `08-launcher.css`
2. Abre el HTML en el navegador
3. Cambia un color, guarda, **recarga** la página (`F5`)

El JS del clic ya está incluido: Play/Detener debería seguir funcionando.

---

## Archivos

- `aprender/ejercicios/08-launcher.html`
- `aprender/ejercicios/08-launcher.css`
- `aprender/ejercicios/08-launcher.js` (ya listo; no hace falta tocarlo)

Cuando se vea oscuro y el botón se note distinto: escribe **listo css**.
