// ============================================
// EJERCICIO 9 — Arrays (versiones)
// ============================================
// Guía: ../08-arrays.md
// Abre 09-versiones.html en el navegador
//

const versiones = ["1.21.11", "1.19.2", "1.8.9"];

const lista = document.getElementById("listaVersiones");
const estado = document.getElementById("estado");


for (const version of versiones) {
    const item = document.createElement("li")
    item.textContent = version;
    lista.appendChild(item);

    item.addEventListener("click", function () {
        estado.textContent = `Seleccionada: ${version}`;
    });
}

// TODO 3: Recorre el array y por cada version:
//   - crea un <li> con document.createElement("li")
//   - ponle textContent = version
//   - agrégalo a la lista con lista.appendChild(item)
//
// Pista:
// for (const version of versiones) {
//   ...
// }


// TODO 4 (extra): Dentro del for, haz que al hacer clic en cada li
// cambie el estado a: "Seleccionada: 1.21" (con esa version)
//
// Pista:
// item.addEventListener("click", function () {
//   estado.textContent = `Seleccionada: ${version}`;
// });
