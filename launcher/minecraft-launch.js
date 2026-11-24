// ============================================
// Lanza Minecraft (vanilla) con minecraft-launcher-core
// Corre en el proceso principal de Electron.
// ============================================

const path = require("path");
const { app } = require("electron");
const { Client } = require("minecraft-launcher-core");

let launcher = null;
let procesoMinecraft = null;

function carpetaJuego() {
  // Carpeta propia del cliente (no toca el .minecraft oficial)
  return path.join(app.getPath("appData"), ".nullclient");
}

function avisar(ventana, canal, datos) {
  if (ventana && !ventana.isDestroyed()) {
    ventana.webContents.send(canal, datos);
  }
}

/**
 * Descarga (si hace falta) y arranca la versión pedida.
 * @param {BrowserWindow} ventana
 * @param {{ versionId: string, authorization: object }} opciones
 */
async function lanzarMinecraft(ventana, opciones) {
  const versionId = opciones.versionId;
  const authorization = opciones.authorization;
  if (!authorization || !authorization.access_token || !authorization.name || !authorization.uuid) {
    throw new Error("Inicia sesión con Microsoft antes de jugar.");
  }

  if (procesoMinecraft && !procesoMinecraft.killed) {
    throw new Error("Minecraft is already running");
  }

  launcher = new Client();

  launcher.on("progress", function (progreso) {
    // progreso: { type, task, total }
    const total = progreso.total || 0;
    const task = progreso.task || 0;
    const pct = total > 0 ? Math.min(100, Math.round((task / total) * 100)) : 0;
    avisar(ventana, "juego:progreso", {
      pct: pct,
      texto: (progreso.type || "Downloading") + "…",
    });
  });

  launcher.on("download-status", function (estado) {
    if (estado && estado.current != null && estado.total) {
      const pct = Math.min(100, Math.round((estado.current / estado.total) * 100));
      avisar(ventana, "juego:progreso", {
        pct: pct,
        texto: "Downloading files…",
      });
    }
  });

  launcher.on("data", function () {
    // Salida de Java; opcional para depurar
  });

  launcher.on("close", function (codigo) {
    procesoMinecraft = null;
    avisar(ventana, "juego:cerrado", { codigo: codigo });
  });

  avisar(ventana, "juego:progreso", { pct: 2, texto: "Preparing…" });
  avisar(ventana, "juego:progreso", {
    pct: 8,
    texto: "Launching " + versionId + " as " + authorization.name + "…",
  });

  const opts = {
    authorization: authorization,
    root: carpetaJuego(),
    version: {
      number: versionId,
      type: "release",
    },
    memory: {
      max: "4G",
      min: "2G",
    },
    overrides: {
      detached: false,
    },
  };

  // Conectar directo a un servidor si viene address
  if (opciones.serverAddress) {
    opts.customLaunchArgs = ["--server", opciones.serverAddress];
    if (opciones.serverPort) {
      opts.customLaunchArgs.push("--port", String(opciones.serverPort));
    }
  }

  procesoMinecraft = await launcher.launch(opts);

  if (!procesoMinecraft) {
    throw new Error("Could not start Minecraft process");
  }

  avisar(ventana, "juego:progreso", { pct: 100, texto: "Game started" });
  avisar(ventana, "juego:iniciado", { versionId: versionId });

  return { ok: true, root: carpetaJuego() };
}

function detenerMinecraft() {
  if (procesoMinecraft && !procesoMinecraft.killed) {
    procesoMinecraft.kill();
    procesoMinecraft = null;
    return true;
  }
  procesoMinecraft = null;
  return false;
}

function estaCorriendo() {
  return !!(procesoMinecraft && !procesoMinecraft.killed);
}

module.exports = {
  lanzarMinecraft,
  detenerMinecraft,
  estaCorriendo,
  carpetaJuego,
};
