// ============================================
// Null Client — proceso principal de Electron
// Este archivo crea la ventana de Windows.
// El HTML/CSS/JS (index.html) se ve DENTRO de esa ventana.
// ============================================

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const {
  lanzarMinecraft,
  detenerMinecraft,
  estaCorriendo,
} = require("./minecraft-launch");
const { leerAjustes, escribirAjustes } = require("./launcher-store");
const { revisarServidores } = require("./server-tracker");

let ventanaPrincipal = null;

function crearVentana() {
  ventanaPrincipal = new BrowserWindow({
    width: 1200,
    height: 820,
    // Tamaño fijo: no se puede estirar ni agrandar
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: "#090a09",
    // false = usamos nuestra titlebar HTML (min / close)
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Carga tu UI actual
  ventanaPrincipal.loadFile(path.join(__dirname, "index.html"));

  ventanaPrincipal.once("ready-to-show", function () {
    ventanaPrincipal.show();
  });

  ventanaPrincipal.on("closed", function () {
    ventanaPrincipal = null;
  });
}

// Controles de la titlebar (los manda el preload desde el HTML)
ipcMain.on("ventana:minimizar", function () {
  if (ventanaPrincipal) {
    ventanaPrincipal.minimize();
  }
});

ipcMain.on("ventana:cerrar", function () {
  if (ventanaPrincipal) {
    ventanaPrincipal.close();
  }
});

// ---------- Minecraft ----------

ipcMain.handle("juego:lanzar", async function (_evento, opciones) {
  try {
    const resultado = await lanzarMinecraft(ventanaPrincipal, opciones || {});
    return { ok: true, root: resultado.root };
  } catch (error) {
    return {
      ok: false,
      error: error && error.message ? error.message : String(error),
    };
  }
});

ipcMain.handle("juego:detener", async function () {
  detenerMinecraft();
  return { ok: true };
});

ipcMain.handle("juego:estado", async function () {
  return { corriendo: estaCorriendo() };
});

// ---------- Ajustes (servidores + versión) ----------

ipcMain.handle("ajustes:cargar", async function () {
  return leerAjustes();
});

ipcMain.handle("ajustes:guardar", async function (_evento, parcial) {
  return escribirAjustes(parcial || {});
});

ipcMain.handle("servidores:revisar", async function () {
  try {
    const ajustes = leerAjustes();
    const estado = await revisarServidores(ajustes.lastServers || []);
    // Persistir la lista detectada
    escribirAjustes({ lastServers: estado.servers });
    return { ok: true, ...estado };
  } catch (error) {
    return {
      ok: false,
      error: error && error.message ? error.message : String(error),
      servers: [],
      playing: false,
      current: null,
    };
  }
});

app.whenReady().then(crearVentana);

app.on("window-all-closed", function () {
  detenerMinecraft();
  // En Windows/Linux, cerrar todas las ventanas cierra la app
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // macOS: reabrir si no hay ventanas
  if (BrowserWindow.getAllWindows().length === 0) {
    crearVentana();
  }
});
