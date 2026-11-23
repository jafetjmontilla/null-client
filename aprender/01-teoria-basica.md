# JavaScript desde cero — Teoría básica

Bienvenido. Este documento es tu **primera lección**. Léelo con calma.
No hace falta memorizar todo: lo importante es **entender la idea** de cada sección.

Cuando termines, avísame y pasamos a ejercicios cortos.

---

## 1. ¿Qué es programar?

Programar es **darle instrucciones a la computadora** en un lenguaje que ella entiende.

Ejemplo en humano:

> Si el usuario hace clic en Play, muestra "Iniciando..."

En código (JavaScript) será algo parecido: una **condición** + una **acción**.

---

## 2. ¿Qué es JavaScript?

**JavaScript** (a menudo abreviado **JS**) es un lenguaje de programación.

Con él puedes:

- Hacer que una página web **reaccione** (botones, menús, mensajes)
- Más adelante: crear una **app de escritorio** (como el launcher de Lunar)
- Y también: servidores, bots, herramientas, etc.

En este proyecto lo usaremos primero para el **launcher**.

---

## 3. ¿Qué es Node.js? (ya lo tienes instalado)

**Node.js** permite ejecutar JavaScript **fuera del navegador**.

| Dónde | Para qué |
|-------|----------|
| Navegador (Chrome, Edge…) | Páginas web |
| Node.js | Apps, herramientas, launchers, servidores |

En tu PC ya está:

- **Node.js** `v24.20.0`
- **npm** `11.19.0` (gestor de paquetes: instala librerías hechas por otros)

No necesitas descargarlo otra vez. Si algún día lo necesitas de cero: [https://nodejs.org](https://nodejs.org) → botón **LTS**.

---

## 4. Archivos que vas a ver mucho

En un proyecto web/launcher típico aparecen estos tres:

| Archivo | Rol | Analogía |
|---------|-----|----------|
| `.html` | Estructura (qué hay en la pantalla) | Esqueleto |
| `.css` | Apariencia (colores, tamaños) | Ropa / pintura |
| `.js` | Comportamiento (qué pasa al hacer clic) | Cerebro |

Por ahora nos centramos en **JavaScript**. HTML y CSS vendrán después, en pequeño.

---

## 5. Comentarios

Los comentarios son notas para humanos. La computadora **los ignora**.

```js
// Esto es un comentario de una línea

/*
  Esto es un comentario
  de varias líneas
*/
```

Úsalos para explicarte a ti mismo qué hace cada parte.

---

## 6. Variables — cajas con nombre

Una **variable** guarda un valor para usarlo después.

En JavaScript moderno usamos casi siempre `const` y `let`:

```js
const nombre = "Sebas"; // const = no vas a cambiar este valor
let vidas = 3;          // let = sí puede cambiar después

vidas = 2; // válido, porque usamos let
```

### Regla sencilla

- `const` → valor fijo (nombre de la app, versión, etc.)
- `let` → valor que cambia (contador, estado "jugando", etc.)
- Evita `var` (es la forma antigua; hoy casi no se usa en código nuevo)

### Nombres de variables

- Pueden tener letras, números, `_`
- No pueden empezar con número
- Usa nombres claros: `usuario`, no `x`

```js
const usuario = "Steve";
let listoParaJugar = false;
```

---

## 7. Tipos de datos básicos

Todo valor tiene un **tipo**:

| Tipo | Ejemplo | Uso típico |
|------|---------|------------|
| `string` (texto) | `"Hola"`, `'Play'` | Nombres, mensajes |
| `number` (número) | `20`, `1.5`, `-3` | Vidas, versión, contadores |
| `boolean` | `true` / `false` | Sí/no, encendido/apagado |
| `undefined` | `undefined` | Todavía no tiene valor |
| `null` | `null` | Vacío a propósito |

```js
const mensaje = "Iniciando Minecraft..."; // string
const version = 1.21;                     // number
const conectado = true;                   // boolean
```

### Texto + texto = concatenación

```js
const nombre = "Alex";
const saludo = "Hola, " + nombre; // "Hola, Alex"
```

Forma moderna (recomendada), llamada **template string**:

```js
const nombre = "Alex";
const saludo = `Hola, ${nombre}`; // misma idea, más limpia
```

Las comillas invertidas `` ` `` permiten meter variables con `${...}`.

---

## 8. Operadores (hacer cuentas y comparar)

### Matemáticos

```js
2 + 3   // 5
10 - 4  // 6
3 * 2   // 6
8 / 2   // 4
```

### Comparación (dan `true` o `false`)

```js
5 === 5   // true  (igual estricto: valor y tipo)
5 !== 3   // true  (distinto)
10 > 3    // true
2 < 1     // false
```

**Importante:** usa `===` y `!==`, no `==` / `!=` (esas tienen rarezas raras).

### Lógicos

```js
true && false  // false  (AND: ambas deben ser true)
true || false  // true   (OR: al menos una true)
!true          // false  (NOT: invierte)
```

---

## 9. Condicionales — tomar decisiones

`if` / `else` = "si pasa esto, haz aquello".

```js
const vidas = 0;

if (vidas > 0) {
  console.log("Sigues vivo");
} else {
  console.log("Game over");
}
```

También puedes encadenar:

```js
const fps = 60;

if (fps >= 60) {
  console.log("Fluido");
} else if (fps >= 30) {
  console.log("Aceptable");
} else {
  console.log("Lag");
}
```

En tu launcher futuro:

```js
if (minecraftInstalado) {
  // lanzar el juego
} else {
  // mostrar "Instala Minecraft primero"
}
```

---

## 10. Funciones — bloques reutilizables

Una **función** es un pedazo de código con nombre que puedes **llamar** cuando quieras.

```js
function saludar(nombre) {
  return `Hola, ${nombre}`;
}

const texto = saludar("Sebas");
console.log(texto); // "Hola, Sebas"
```

- `nombre` es un **parámetro** (dato de entrada)
- `return` **devuelve** un resultado
- `saludar("Sebas")` es **llamar** a la función

Forma moderna (flecha):

```js
const saludar = (nombre) => {
  return `Hola, ${nombre}`;
};
```

Las dos formas sirven. Empezaremos con `function` porque se lee más claro al principio.

---

## 11. `console.log` — tu mejor amigo al aprender

Sirve para **imprimir** cosas y ver qué está pasando.

```js
console.log("Hola mundo");
console.log(2 + 2);
```

Más adelante lo verás en la **terminal** (con Node) o en las **DevTools** del navegador.

Si algo "no funciona", lo primero es: ¿qué imprime `console.log`?

---

## 12. Cómo se lee un programa (orden)

JavaScript normalmente se ejecuta **de arriba hacia abajo**, línea por línea.

```js
console.log("1");
console.log("2");
console.log("3");
// Imprime: 1, luego 2, luego 3
```

Las funciones son una excepción parcial: se **definen** arriba y se **ejecutan** solo cuando las llamas.

```js
function play() {
  console.log("Iniciando...");
}

console.log("Launcher abierto");
play(); // aquí sí se ejecuta play
```

---

## 13. Errores comunes de principiantes

| Error | Qué significa (en simple) |
|-------|---------------------------|
| `is not defined` | Usaste un nombre que no existe / mal escrito |
| `Unexpected token` | Falta o sobra un símbolo: `( ) { } " "` |
| `Cannot read property ... of undefined` | Intentaste usar algo que aún no existe |

**Tip:** lee el mensaje de error desde el final hacia arriba. Suele decir el archivo y el número de línea.

---

## 14. Mapa mental: del launcher a estos conceptos

| Idea del launcher | Concepto JS |
|-------------------|-------------|
| Guardar el nombre del jugador | variable (`const` / `let`) |
| ¿Está Minecraft instalado? | `boolean` + `if` |
| Botón Play | función que se ejecuta al hacer clic |
| Mensaje "Iniciando..." | `string` + `console.log` o cambiar texto en pantalla |
| Versión 1.21 vs 1.20 | comparar con `===` o `>` |

Todavía no construimos el launcher. Primero asegúrate de entender estas ideas.

---

## 15. Mini-repaso (responde mentalmente)

1. ¿Para qué sirve una variable?
2. ¿Cuándo usarías `const` y cuándo `let`?
3. ¿Qué es un `boolean`?
4. ¿Qué hace un `if`?
5. ¿Qué es una función?
6. ¿Para qué sirve `console.log`?

Si puedes responder con tus palabras (aunque sea a medias), estás listo para practicar.

---

## Próximo paso

Cuando digas **"listo"**, haremos la **Lección 2: ejercicios prácticos** en la terminal con Node.js:

- crear un archivo `.js`
- ejecutarlo con `node`
- practicar variables, `if` y funciones con ejemplos del launcher

Sin HTML todavía. Solo JavaScript puro, para que el cerebro se enfoque en una cosa.
