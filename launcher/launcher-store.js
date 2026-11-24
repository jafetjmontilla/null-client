// ============================================
// Guardado en disco (AppData) — servidores + versión
// ============================================

const fs = require("fs");
const path = require("path");
const { app } = require("electron");

function rutaAjustes() {
  return path.join(app.getPath("userData"), "nullclient-settings.json");
}

function leerAjustes() {
  const vacio = {
    lastServers: null,
    lastVersion: null,
    session: null,
  };

  try {
    const archivo = rutaAjustes();
    if (!fs.existsSync(archivo)) {
      return vacio;
    }
    const raw = fs.readFileSync(archivo, "utf8");
    const data = JSON.parse(raw);
    const session =
      data.session && data.session.token && data.session.uuid && data.session.name
        ? {
            token: data.session.token,
            uuid: data.session.uuid,
            name: data.session.name,
            loginId: data.session.loginId || null,
          }
        : null;
    return {
      lastServers: Array.isArray(data.lastServers) ? data.lastServers : null,
      lastVersion: data.lastVersion || null,
      session: session,
    };
  } catch (error) {
    console.error("[NullClient] No se pudieron leer ajustes:", error);
    return vacio;
  }
}

function escribirAjustes(parcial) {
  try {
    const actual = leerAjustes();
    const siguiente = {
      lastServers:
        parcial.lastServers !== undefined ? parcial.lastServers : actual.lastServers,
      lastVersion:
        parcial.lastVersion !== undefined ? parcial.lastVersion : actual.lastVersion,
      session: parcial.session !== undefined ? parcial.session : actual.session,
    };
    const archivo = rutaAjustes();
    const carpeta = path.dirname(archivo);
    if (!fs.existsSync(carpeta)) {
      fs.mkdirSync(carpeta, { recursive: true });
    }
    fs.writeFileSync(archivo, JSON.stringify(siguiente, null, 2), "utf8");
    return { ok: true, path: archivo };
  } catch (error) {
    console.error("[NullClient] No se pudieron guardar ajustes:", error);
    return { ok: false, error: error.message };
  }
}

module.exports = {
  leerAjustes,
  escribirAjustes,
  rutaAjustes,
};
