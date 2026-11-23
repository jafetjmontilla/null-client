// ============================================
// EJERCICIO 7 — Botón Play en el navegador
// ============================================
//
// Guía: ../05-js-en-el-navegador.md
// Abre 07-launcher.html en el navegador (NO uses node aquí)
//

// TODO 4: Busca el botón y el párrafo de estado
// const boton = document.getElementById("botonPlay");
// const estado = document.getElementById("estado");

const boton = document.getElementById("botonPlay");
const estado = document.getElementById("estado");

// TODO 5: Cuando hagan clic en el botón, cambia el texto de estado
// a "Iniciando partida para MrPerff..."

boton.addEventListener("click", function () {
    if (boton.textContent === "Detener") {
        estado.textContent = "Esperando...";
        boton.textContent = "Play";
        
        } else {
    estado.textContent = "Iniciando partida para MrPerff...";
    boton.textContent = "Detener";
}
});

// Pista:
// boton.addEventListener("click", function () {
//   estado.textContent = "...";
// });
