# Lección 5B — `:hover` (reacción al mouse)

Hasta ahora el CSS era “estático”: siempre igual.
Con **`:hover`** puedes cambiar el estilo **solo mientras el mouse está encima**.

En un launcher se usa mucho en botones.

---

## 1. Qué es un pseudo-selector

`:hover` no es una etiqueta ni un id. Es un **estado**.

```css
button:hover {
  background-color: #5aa1ff;
}
```

Significa: “cuando el mouse esté sobre un `button`, usa este estilo”.

Cuando quitas el mouse, vuelve al estilo normal de `button`.

---

## 2. Dónde va

Normalmente **después** del estilo base del botón:

```css
button {
  background-color: #3d8bfd;
}

button:hover {
  background-color: #5aa1ff;
}
```

Primero el normal, luego el hover.

---

## 3. Ideas útiles para botones

| Propiedad | Efecto típico en hover |
|-----------|------------------------|
| `background-color` | Se aclara o cambia de color |
| `transform: scale(1.05)` | Se agranda un poco |
| `opacity` | Se ve más/menos intenso |

Ejemplo combinado:

```css
button:hover {
  background-color: #5aa1ff;
  transform: scale(1.05);
}
```

---

## 4. Tu ejercicio

En `08-launcher.css` (el mismo archivo de antes):

1. Agrega al final un bloque `button:hover { ... }`
2. Cambia el color de fondo
3. (Opcional) agrega `transform: scale(1.05);`
4. Recarga el HTML y pasa el mouse por Play

Cuando funcione: **listo hover**.
