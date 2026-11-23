const boton = document.getElementById("botonPlay");
const estado = document.getElementById("estado");

boton.addEventListener("click", function () {
  if (boton.textContent === "Detener") {
    estado.textContent = "Esperando...";
    boton.textContent = "Play";
  } else {
    estado.textContent = "Iniciando partida para MrPerff...";
    boton.textContent = "Detener";
  }
});
