// ============================================
// Null Client — proceso principal de Electron
// Este archivo crea la ventana de Windows.
// El HTML/CSS/JS (index.html) se ve DENTRO de esa ventana.
// ============================================

const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const {
  lanzarMinecraft,
  detenerMinecraft,
  estaCorriendo,
} = require("./minecraft-launch");
const { leerAjustes, escribirAjustes } = require("./launcher-store");
const { revisarServidores } = require("./server-tracker");
const api = require("./null-api");

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

function ajustesParaUi(datos) {
  return {
    lastServers: datos.lastServers,
    lastVersion: datos.lastVersion,
  };
}

function perfilGuardado(datos) {
  if (!datos.session) {
    return null;
  }
  return { name: datos.session.name, uuid: datos.session.uuid };
}

function enlaceMicrosoftPermitido(url) {
  try {
    const destino = new URL(url);
    const host = destino.hostname;
    return (
      destino.protocol === "https:" &&
      (host === "microsoft.com" ||
        host.endsWith(".microsoft.com") ||
        host === "live.com" ||
        host.endsWith(".live.com"))
    );
  } catch (error) {
    return false;
  }
}

// ---------- Minecraft ----------

ipcMain.handle("juego:lanzar", async function (_evento, opciones) {
  const pedido = opciones || {};
  const ajustes = leerAjustes();
  if (!ajustes.session || !ajustes.session.token) {
    return { ok: false, needsLogin: true, error: "Inicia sesión con Microsoft." };
  }

  let authorization;
  try {
    const remoto = await api.authorizationDeLanzamiento(ajustes.session.token);
    authorization = remoto.authorization;
  } catch (error) {
    if (error && error.status === 401) {
      escribirAjustes({ session: null });
      return {
        ok: false,
        needsLogin: true,
        error: error.message || "La sesión caducó. Vuelve a entrar.",
      };
    }
    return {
      ok: false,
      error: error && error.message ? error.message : String(error),
    };
  }

  try {
    const resultado = await lanzarMinecraft(ventanaPrincipal, {
      versionId: pedido.versionId,
      serverAddress: pedido.serverAddress,
      serverPort: pedido.serverPort,
      authorization: authorization,
    });
    if (authorization.name && authorization.uuid) {
      escribirAjustes({
        session: {
          token: ajustes.session.token,
          name: authorization.name,
          uuid: authorization.uuid,
        },
      });
    }
    return { ok: true, root: resultado.root, name: authorization.name };
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
  return ajustesParaUi(leerAjustes());
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

// ---------- Sesión premium (Microsoft → Minecraft) ----------

ipcMain.handle("sesion:actual", async function () {
  const ajustes = leerAjustes();
  if (!ajustes.session || !ajustes.session.token) {
    return { ok: true, profile: null };
  }
  try {
    const perfil = await api.perfil(ajustes.session.token);
    escribirAjustes({
      session: {
        token: ajustes.session.token,
        name: perfil.name,
        uuid: perfil.uuid,
      },
    });
    return { ok: true, profile: { name: perfil.name, uuid: perfil.uuid } };
  } catch (error) {
    if (error && error.status === 401) {
      escribirAjustes({ session: null });
      return { ok: true, profile: null };
    }
    // La API no responde: seguimos mostrando la cuenta guardada.
    return { ok: true, profile: perfilGuardado(ajustes), offline: true };
  }
});

ipcMain.handle("sesion:iniciar", async function () {
  try {
    const inicio = await api.iniciarMicrosoft();
    return { ok: true, ...inicio };
  } catch (error) {
    return {
      ok: false,
      error: error && error.message ? error.message : String(error),
    };
  }
});

ipcMain.handle("sesion:consultar", async function (_evento, loginId) {
  try {
    const estado = await api.consultarMicrosoft(loginId);
    if (estado.status === "ready" && estado.sessionToken && estado.profile) {
      escribirAjustes({
        session: {
          token: estado.sessionToken,
          name: estado.profile.name,
          uuid: estado.profile.uuid,
        },
      });
      return { ok: true, status: "ready", profile: estado.profile };
    }
    return { ok: true, status: estado.status, error: estado.error || null };
  } catch (error) {
    return {
      ok: false,
      status: "error",
      error: error && error.message ? error.message : String(error),
    };
  }
});

ipcMain.handle("sesion:cerrar", async function () {
  const ajustes = leerAjustes();
  if (ajustes.session && ajustes.session.token) {
    try {
      await api.cerrarSesion(ajustes.session.token);
    } catch (error) {
      /* Si la API está caída, igual borramos la sesión local. */
    }
  }
  escribirAjustes({ session: null });
  return { ok: true };
});

ipcMain.handle("enlace:abrir", async function (_evento, url) {
  if (!enlaceMicrosoftPermitido(url)) {
    return { ok: false };
  }
  await shell.openExternal(url);
  return { ok: true };
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
