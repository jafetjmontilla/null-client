# Lección 6 — Arrays (listas)

Un launcher necesita guardar varias versiones: `1.21`, `1.20.4`, `1.19.2`...
Para eso usamos un **array**: una lista ordenada de valores.

---

## 1. Qué es un array

```js
const versiones = ["1.21", "1.20.4", "1.19.2"];
```

- Empieza y termina con `[ ]`
- Los valores se separan con comas
- Cada valor tiene una **posición** (índice) empezando en **0**

| Posición | Valor |
|----------|-------|
| 0 | `"1.21"` |
| 1 | `"1.20.4"` |
| 2 | `"1.19.2"` |

```js
console.log(versiones[0]); // "1.21"
console.log(versiones[1]); // "1.20.4"
console.log(versiones.length); // 3 (cuántos hay)
```

---

## 2. Recorrer la lista (`for`)

```js
for (let i = 0; i < versiones.length; i++) {
  console.log(versiones[i]);
}
```

Significa: “desde 0 hasta el final, imprime cada versión”.

Forma más corta (moderna):

```js
for (const version of versiones) {
  console.log(version);
}
```

En el ejercicio usarás la forma corta.

---

## 3. Agregar un elemento a la página

En el navegador puedes crear HTML desde JS:

```js
const lista = document.getElementById("listaVersiones");

const item = document.createElement("li");
item.textContent = "1.21";
lista.appendChild(item);
```

| Pieza | Significado |
|-------|-------------|
| `createElement("li")` | Crea un `<li>` en memoria |
| `textContent` | Le pone texto |
| `appendChild` | Lo agrega dentro de la lista |

Si lo haces dentro de un `for`, aparecen todas las versiones.

---

## 4. Tu ejercicio

Archivos nuevos:

- `09-versiones.html`
- `09-versiones.js`
- `09-versiones.css` (mínimo, ya listo)

Completa los TODO del JS. Al abrir el HTML deberías ver la lista de versiones en pantalla.

Cuando funcione: **listo arrays**.
