# Lección 3A — Mini launcher en la terminal

Vas a unir **variables + if + función** en un solo archivo.

No copies de memoria: piensa qué hace cada parte.
Si te trabas, pide una pista (no la solución completa).

---

## Archivo

`aprender/ejercicios/05-mini-launcher.js`

---

## Qué debe hacer el programa

Al ejecutar `node 05-mini-launcher.js` debería verse algo así:

```
=== Null Client v0.1 ===
Jugador: MrPerff
Listo para jugar
Iniciando partida para MrPerff...
Launcher cerrado
```

Si `minecraftInstalado` es `false`, en cambio:

```
=== Null Client v0.1 ===
Jugador: MrPerff
Instala Minecraft primero
Launcher cerrado
```

(Sin llamar a `play` si no está instalado.)

---

## Orden sugerido dentro del archivo

1. Constantes: nombre de la app, versión, nombre del jugador, `minecraftInstalado`
2. Función `play(nombre)` (como en el ejercicio 4)
3. `console.log` del título del launcher
4. `console.log` del jugador
5. `if / else`:
   - si está instalado → mensaje + llamar `play`
   - si no → mensaje de instalar
6. Al final: `console.log("Launcher cerrado")`

---

## Cómo probarlo

```powershell
cd "e:\Cliente de minecraft\aprender\ejercicios"
node 05-mini-launcher.js
```

Prueba con `minecraftInstalado = true` y luego `false`.

---

## Cuando termine

Escribe **"listo A"** y pasamos a la **3B: HTML del launcher**.
