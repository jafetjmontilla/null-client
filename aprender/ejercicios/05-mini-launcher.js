// ============================================
// EJERCICIO 5 — Mini launcher (todo junto)
// ============================================
//
// Une variables + función + if.
// Guía: ../03-mini-launcher.md
// Ejecuta: node 05-mini-launcher.js
//

// TODO 1: Constantes
// - nombreApp (texto)
// - version (número o texto, tú eliges)
// - nombreJugador (tu nombre)
// - minecraftInstalado (true o false)


const nombreApp = "Null Client";
const version = 0.001;
const nombreJugador = "MrPerff";
const minecraftInstalado = false;



// TODO 2: Función play(nombre)
// Debe imprimir: Iniciando partida para NOMBRE...
function play(nombre) {
  console.log(`Iniciando partida para ${nombre}...`);
}

// TODO 3: Imprimir título del launcher
// Ejemplo de idea: === Null Client v0.1 ===
// Puedes usar template string: `=== ${nombreApp} v${version} ===`

console.log(`=== ${nombreApp} v${version} ===`);

// TODO 4: Imprimir el jugador

console.log(`Jugador: ${nombreJugador}`);


// TODO 5: if / else
// si minecraftInstalado:
//   - mensaje "Listo para jugar"
//   - llamar play(nombreJugador)
// si no:
//   - mensaje "Instala Minecraft primero"

if (minecraftInstalado) {
  console.log("Listo para jugar")
  play(nombreJugador)
} else {
  console.log("Debes instalar Minecraft primero")
}

// TODO 6: console.log("Launcher cerrado")
console.log("Launcher cerrado");