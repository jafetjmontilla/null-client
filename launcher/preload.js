// ============================================
// Bridge seguro entre HTML y Electron
// El HTML NO tiene Node directo; usa window.nullClient
// ============================================

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nullClient", {
  minimizar: function () {
    ipcRenderer.send("ventana:minimizar");
  },
  cerrar: function () {
    ipcRenderer.send("ventana:cerrar");
  },

  // Lanza Minecraft (proceso principal)
  lanzarJuego: function (opciones) {
    return ipcRenderer.invoke("juego:lanzar", opciones);
  },
  detenerJuego: function () {
    return ipcRenderer.invoke("juego:detener");
  },
  estadoJuego: function () {
    return ipcRenderer.invoke("juego:estado");
  },

  // Persistencia en disco (AppData)
  cargarAjustes: function () {
    return ipcRenderer.invoke("ajustes:cargar");
  },
  guardarAjustes: function (parcial) {
    return ipcRenderer.invoke("ajustes:guardar", parcial);
  },

  // Lee logs / servers.dat / iconos cada poll
  revisarServidores: function () {
    return ipcRenderer.invoke("servidores:revisar");
  },

  // Eventos que manda el main → UI
  onProgresoJuego: function (callback) {
    ipcRenderer.on("juego:progreso", function (_e, datos) {
      callback(datos);
    });
  },
  onJuegoIniciado: function (callback) {
    ipcRenderer.on("juego:iniciado", function (_e, datos) {
      callback(datos);
    });
  },
  onJuegoCerrado: function (callback) {
    ipcRenderer.on("juego:cerrado", function (_e, datos) {
      callback(datos);
    });
  },

  // true solo cuando corre dentro de Electron
  esElectron: true,
});
