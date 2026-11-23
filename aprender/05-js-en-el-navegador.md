# Lección 4 — JavaScript en el navegador (botón Play)

En la terminal usabas `node archivo.js`.
En el navegador, el JS se **conecta** al HTML y puede cambiar lo que se ve.

---

## 1. La idea

1. En HTML le pones un **id** a un elemento (como un nombre único).
2. En JS buscas ese elemento con `document.getElementById("...")`.
3. Escuchas el clic con `addEventListener("click", ...)`.
4. Cambias el texto con `.textContent`.

---

## 2. id en HTML

```html
<p id="estado">Esperando...</p>
<button id="botonPlay">Play</button>
```

`id` debe ser **único** en la página.

---

## 3. Enlazar el JS al HTML

Al final del `body` (importante: abajo del todo):

```html
<script src="07-launcher.js"></script>
</body>
```

Así el HTML ya existe cuando el JS lo busca.

---

## 4. Buscar elementos y reaccionar al clic

```js
const boton = document.getElementById("botonPlay");
const estado = document.getElementById("estado");

boton.addEventListener("click", function () {
  estado.textContent = "Iniciando partida...";
});
```

| Pieza | Significado |
|-------|-------------|
| `getElementById` | Busca el elemento por su id |
| `addEventListener("click", ...)` | “Cuando hagan clic, ejecuta esta función” |
| `textContent` | El texto visible de ese elemento |

La función dentro de `addEventListener` es como tu `play()`, pero se dispara sola al hacer clic.

---

## 5. Cómo probarlo

1. Completa los TODO de los archivos del ejercicio.
2. Abre `07-launcher.html` en el navegador (doble clic).
3. Haz clic en **Play**.
4. El párrafo de estado debería cambiar.

Si no cambia: clic derecho en la página → **Inspeccionar** → pestaña **Console** (ahí salen errores, parecido a la terminal).

---

## Archivos

- `aprender/ejercicios/07-launcher.html`
- `aprender/ejercicios/07-launcher.js`

Cuando el clic funcione, escribe **listo clic**.
