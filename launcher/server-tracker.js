// ============================================
// Detecta el último server jugado leyendo:
// - logs/latest.log  → "Connecting to host, port"
// - servers.dat      → nombre + icono
// - ping al server   → favicon si falta icono
// ============================================

const fs = require("fs");
const path = require("path");
const nbt = require("prismarine-nbt");
const util = require("minecraft-server-util");
const { carpetaJuego, estaCorriendo } = require("./minecraft-launch");

const MAX = 4;
const CONNECT_RE = /Connecting to ([^\s,]+)(?:,\s*(\d+))?/i;
const STOP_RE = /\]: Stopping!/;

function carpetaIconos() {
  const dir = path.join(carpetaJuego(), "nullclient-icons");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function inicialesDe(texto) {
  const limpio = String(texto || "?")
    .replace(/^https?:\/\//, "")
    .split(".")[0]
    .replace(/[^a-zA-Z0-9]/g, "");
  return (limpio.slice(0, 2) || "??").toUpperCase();
}

function nombreBonito(host, nombreGuardado) {
  if (nombreGuardado && nombreGuardado !== "Minecraft Server") {
    return nombreGuardado;
  }
  const base = String(host || "Server").split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function claveServer(address, port) {
  const host = String(address || "").toLowerCase();
  const p = Number(port) || 25565;
  return host + ":" + p;
}

/** Lee conexiones del log y si sigue en un server ahora. */
function leerEstadoDesdeLog() {
  const logPath = path.join(carpetaJuego(), "logs", "latest.log");
  if (!fs.existsSync(logPath)) {
    return { current: null, history: [] };
  }

  let texto = "";
  try {
    texto = fs.readFileSync(logPath, "utf8");
  } catch (error) {
    return { current: null, history: [] };
  }

  const lineas = texto.split(/\r?\n/);
  const history = [];
  let current = null;

  for (const linea of lineas) {
    if (STOP_RE.test(linea)) {
      current = null;
      continue;
    }
    const match = linea.match(CONNECT_RE);
    if (!match) {
      continue;
    }
    const address = match[1];
    const port = Number(match[2]) || 25565;
    // Timestamp del log: [22:11:42]
    const hora = linea.match(/^\[(\d{2}):(\d{2}):(\d{2})\]/);
    let playedAt = Date.now();
    if (hora) {
      const ahora = new Date();
      const stamp = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        Number(hora[1]),
        Number(hora[2]),
        Number(hora[3])
      );
      // Si el stamp queda en el futuro (log de anoche), restar un día
      if (stamp.getTime() > ahora.getTime() + 60000) {
        stamp.setDate(stamp.getDate() - 1);
      }
      playedAt = stamp.getTime();
    }

    const entry = {
      address: address,
      port: port,
      playedAt: playedAt,
      key: claveServer(address, port),
    };
    history.push(entry);
    current = entry;
  }

  // Si el proceso de Minecraft ya no corre, no estamos "jugando"
  if (!estaCorriendo()) {
    current = null;
  }

  return { current: current, history: history };
}

/** Lee servers.dat → mapa ip → { name, iconBase64 } */
async function leerServersDat() {
  const mapa = new Map();
  const archivo = path.join(carpetaJuego(), "servers.dat");
  if (!fs.existsSync(archivo)) {
    return mapa;
  }

  try {
    const buf = fs.readFileSync(archivo);
    const parsed = await nbt.parse(buf);
    const data = nbt.simplify(parsed.parsed);
    const lista = (data && data.servers) || [];
    for (const s of lista) {
      if (!s || !s.ip) {
        continue;
      }
      const host = String(s.ip).split(":")[0].toLowerCase();
      mapa.set(host, {
        name: s.name || "",
        iconBase64: s.icon || "",
      });
      mapa.set(String(s.ip).toLowerCase(), {
        name: s.name || "",
        iconBase64: s.icon || "",
      });
    }
  } catch (error) {
    console.error("[NullClient] servers.dat:", error.message);
  }
  return mapa;
}

function guardarIconoBase64(key, base64) {
  if (!base64) {
    return null;
  }
  let raw = base64;
  const coma = raw.indexOf(",");
  if (raw.startsWith("data:") && coma !== -1) {
    raw = raw.slice(coma + 1);
  }
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_");
  const destino = path.join(carpetaIconos(), safe + ".png");
  try {
    fs.writeFileSync(destino, Buffer.from(raw, "base64"));
    // file:// para el renderer de Electron
    return "file:///" + destino.replace(/\\/g, "/");
  } catch (error) {
    console.error("[NullClient] icon save:", error.message);
    return null;
  }
}

async function obtenerIconoPorPing(address, port) {
  try {
    const status = await util.status(address, port || 25565, {
      timeout: 3500,
      enableSRV: true,
    });
    if (status && status.favicon) {
      return guardarIconoBase64(claveServer(address, port), status.favicon);
    }
  } catch (error) {
    // Server offline / timeout: sin icono
  }
  return null;
}

/**
 * Construye hasta 4 últimos servers con icono/nombre.
 * @param {Array} guardados lista previa del settings
 */
async function revisarServidores(guardados) {
  const { current, history } = leerEstadoDesdeLog();
  const dat = await leerServersDat();

  // Más reciente primero, únicos por host:port
  const vistos = new Map();
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if (!vistos.has(h.key)) {
      vistos.set(h.key, h);
    }
  }

  // También respeta lo ya guardado (por si el log se rotó)
  const previos = Array.isArray(guardados) ? guardados : [];
  for (const prev of previos) {
    if (!prev || !prev.address) {
      continue;
    }
    const key = claveServer(prev.address, prev.port || 25565);
    if (!vistos.has(key)) {
      vistos.set(key, {
        address: prev.address,
        port: prev.port || 25565,
        playedAt: Number(prev.playedAt) || 0,
        key: key,
        nombre: prev.nombre,
        icono: prev.icono,
        iniciales: prev.iniciales,
      });
    }
  }

  const ordenados = Array.from(vistos.values()).sort(function (a, b) {
    return (b.playedAt || 0) - (a.playedAt || 0);
  });

  const resultado = [];
  for (const item of ordenados.slice(0, MAX)) {
    const meta = dat.get(item.address.toLowerCase()) || dat.get(item.key) || {};
    const nombre = item.nombre || nombreBonito(item.address, meta.name);
    const iniciales = item.iniciales || inicialesDe(nombre);

    let icono = item.icono || null;
    if (!icono && meta.iconBase64) {
      icono = guardarIconoBase64(item.key, meta.iconBase64);
    }
    if (!icono) {
      icono = await obtenerIconoPorPing(item.address, item.port);
    }

    const jugandoAhora =
      !!(current && current.key === item.key && estaCorriendo());

    resultado.push({
      nombre: nombre,
      address: item.address,
      port: item.port || 25565,
      icono: icono || "",
      banner: icono || "",
      iniciales: iniciales,
      playedAt: jugandoAhora ? Date.now() : item.playedAt,
      playing: jugandoAhora,
    });
  }

  return {
    playing: !!(current && estaCorriendo()),
    current: current
      ? {
          address: current.address,
          port: current.port,
          since: current.playedAt,
        }
      : null,
    servers: resultado,
  };
}

module.exports = {
  revisarServidores,
  carpetaIconos,
};
