// ============================================
// Null Client — lógica del launcher
// Léelo de arriba a abajo: primero datos, luego UI, luego eventos.
// ============================================

// ---------- 0) ¿Estamos en Electron? ----------
// Quita el recuadro de “página web” y ocupa toda la ventana
if (window.nullClient && window.nullClient.esElectron) {
  document.body.classList.add("is-electron");
}

// ---------- 1) Datos ----------

const versiones = [
  {
    id: "1.21.11",
    label: "Fabric 1.21.11",
    meta: "NullCore · Sodium",
    tag: "Latest",
    hero: "assets/hero-1.21.11.jpg",
  },
  {
    id: "1.19.2",
    label: "Fabric 1.19.2",
    meta: "SMP · Mods",
    tag: "SMP",
    hero: "assets/hero-1.19.2.jpg",
  },
  {
    id: "1.8.9",
    label: "PvP 1.8.9",
    meta: "OptiFine · HitReg",
    tag: "Competitive",
    hero: "assets/hero-1.8.9.jpg",
  },
];

// Last Servers — detectados desde el juego (log + servers.dat), sin demos
const CLAVE_SERVIDORES = "nullclient.lastServers";
const CLAVE_VERSION = "nullclient.lastVersion";
const MAX_SERVIDORES = 4;

let versionElegida = null;
let menuAbierto = false;
let lanzando = false;
let servidorSeleccionado = null;
let servidoresRecientes = [];
let ajustesListos = false;
let pollServidoresEnCurso = false;

function normalizarListaServidores(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    return [];
  }
  return lista
    .map(function (s) {
      return {
        nombre: s.nombre,
        icono: s.icono || "",
        iniciales: s.iniciales || (s.nombre || "?").slice(0, 2).toUpperCase(),
        address: s.address || "",
        port: s.port || 25565,
        banner: s.banner || s.icono || "",
        playedAt: Number(s.playedAt) || Date.now(),
        playing: !!s.playing,
      };
    })
    .slice(0, MAX_SERVIDORES);
}

/** Guarda servidores + versión juntos en disco (espera confirmación). */
async function persistirEstado(versionId) {
  const id =
    versionId ||
    (versionElegida && versionElegida.id) ||
    null;

  try {
    localStorage.setItem(CLAVE_SERVIDORES, JSON.stringify(servidoresRecientes));
    if (id) {
      localStorage.setItem(CLAVE_VERSION, id);
    }
  } catch (error) {
    /* ignore */
  }

  if (window.nullClient && window.nullClient.guardarAjustes) {
    const resultado = await window.nullClient.guardarAjustes({
      lastServers: servidoresRecientes,
      lastVersion: id,
    });
    if (!resultado || !resultado.ok) {
      console.error("Failed to save settings", resultado);
      return false;
    }
    return true;
  }
  return true;
}

function guardarServidores() {
  return persistirEstado();
}

function guardarVersionId(id) {
  return persistirEstado(id);
}

function textoJugado(server) {
  if (server && server.playing) {
    return "Playing now";
  }
  const playedAt = server && server.playedAt ? server.playedAt : server;
  if (!playedAt) {
    return "—";
  }
  const diff = Date.now() - playedAt;
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);

  if (minutos < 1) {
    return "Just now";
  }
  if (minutos < 60) {
    return minutos + " min ago";
  }
  if (horas < 24) {
    return horas === 1 ? "1 hour ago" : horas + " hours ago";
  }
  if (dias === 1) {
    return "Yesterday";
  }
  if (dias < 7) {
    return dias + " days ago";
  }
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return semanas === 1 ? "1 week ago" : semanas + " weeks ago";
  }
  return new Date(playedAt).toLocaleDateString();
}

/** Mueve el server al tope, actualiza fecha y guarda (máx. 4). */
async function registrarServidorJugado(server) {
  if (!server || !server.nombre) {
    return null;
  }
  const actualizado = Object.assign({}, server, { playedAt: Date.now() });
  servidoresRecientes = servidoresRecientes.filter(function (s) {
    return s.nombre.toLowerCase() !== server.nombre.toLowerCase();
  });
  servidoresRecientes.unshift(actualizado);
  if (servidoresRecientes.length > MAX_SERVIDORES) {
    servidoresRecientes = servidoresRecientes.slice(0, MAX_SERVIDORES);
  }
  servidorSeleccionado = actualizado;
  await guardarServidores();
  pintarServidores();
  return actualizado;
}

function seleccionarServidor(server) {
  servidorSeleccionado = server;
  pintarServidores();
}

// ---------- 2) Elementos del HTML ----------

const botonPlay = document.getElementById("botonPlay");
const playLabel = document.getElementById("playLabel");
const playIconUse = document.getElementById("playIconUse");

function ponerModoPlay() {
  playLabel.textContent = "PLAY";
  botonPlay.classList.remove("is-stop");
  if (playIconUse) {
    playIconUse.setAttribute("href", "#i-play");
  }
}

function ponerModoStop() {
  playLabel.textContent = "STOP";
  botonPlay.classList.add("is-stop");
  if (playIconUse) {
    playIconUse.setAttribute("href", "#i-stop");
  }
}
const estado = document.getElementById("estado");
const tituloVersion = document.getElementById("tituloVersion");
const metaVersion = document.getElementById("metaVersion");
const versionBtn = document.getElementById("versionBtn");
const versionLabel = document.getElementById("versionLabel");
const versionMenu = document.getElementById("versionMenu");
const barraLanzamiento = document.getElementById("barraLanzamiento");
const launchTexto = document.getElementById("launchTexto");
const launchPct = document.getElementById("launchPct");
const launchFill = document.getElementById("launchFill");
const ventana = document.getElementById("ventana");
const nav = document.getElementById("nav");
const listaServidores = document.getElementById("listaServidores");
const heroMedia = document.querySelector(".hero-media");

// ---------- 3) Últimos servidores (grilla 2x2) ----------

function pintarServidores() {
  if (!listaServidores) {
    return;
  }
  listaServidores.innerHTML = "";

  if (servidoresRecientes.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "servers-empty";
    vacio.textContent = "Join a multiplayer server in-game — it will show up here.";
    listaServidores.appendChild(vacio);
    return;
  }

  for (const server of servidoresRecientes) {
    const card = document.createElement("article");
    const seleccionado =
      servidorSeleccionado &&
      servidorSeleccionado.address &&
      server.address &&
      servidorSeleccionado.address.toLowerCase() === server.address.toLowerCase();
    card.className =
      "server card-lift" +
      (seleccionado ? " is-selected" : "") +
      (server.playing ? " is-playing" : "");

    const banner = server.banner || server.icono || "";
    const iconSrc = server.icono || "";

    card.innerHTML =
      '<div class="server-banner"' +
      (banner
        ? ' style="background-image: url(\'' + banner + "')\""
        : "") +
      ' aria-hidden="true"></div>' +
      '<div class="server-content">' +
      '<div class="server-icon-wrap">' +
      (iconSrc
        ? '<img class="fav" src="' +
          iconSrc +
          '" alt="" onerror="this.classList.add(\'missing\')" />'
        : "") +
      '<div class="fav-fallback" aria-hidden="true">' +
      server.iniciales +
      "</div>" +
      "</div>" +
      '<div class="server-text">' +
      "<b>" +
      server.nombre.toUpperCase() +
      "</b>" +
      '<span class="server-played" data-played-at="' +
      (server.playedAt || "") +
      '" data-playing="' +
      (server.playing ? "1" : "0") +
      '">' +
      textoJugado(server) +
      "</span>" +
      "</div>" +
      '<button type="button" class="server-play">' +
      '<svg class="ico"><use href="#i-play"></use></svg>' +
      "<span>PLAY</span>" +
      "</button>" +
      "</div>";

    card.addEventListener("click", function () {
      seleccionarServidor(server);
    });

    const playBtn = card.querySelector(".server-play");
    playBtn.addEventListener("click", async function (evento) {
      evento.stopPropagation();
      seleccionarServidor(server);
      await registrarServidorJugado(server);

      // Si ya hay instancia abierta, no relanzar (rompe el botón STOP)
      if (botonPlay.classList.contains("is-stop") || playLabel.textContent === "STOP") {
        estado.textContent = "Stop the game first to join " + server.nombre;
        marcarEnJuego();
        return;
      }

      if (versionElegida) {
        lanzarJuegoReal();
      } else {
        estado.textContent = "Choose a version to join " + server.nombre;
      }
    });

    listaServidores.appendChild(card);
  }
}

/** Poll real: logs + servers.dat + iconos (cada 15 s). */
async function revisarServidoresDesdeJuego() {
  if (pollServidoresEnCurso) {
    return;
  }
  if (!window.nullClient || !window.nullClient.revisarServidores) {
    actualizarTiemposServidores();
    return;
  }

  pollServidoresEnCurso = true;
  try {
    const estadoSrv = await window.nullClient.revisarServidores();
    if (estadoSrv && estadoSrv.ok) {
      servidoresRecientes = normalizarListaServidores(estadoSrv.servers);
      try {
        localStorage.setItem(CLAVE_SERVIDORES, JSON.stringify(servidoresRecientes));
      } catch (error) {
        /* ignore */
      }
      pintarServidores();
    } else {
      actualizarTiemposServidores();
    }
  } catch (error) {
    console.error("Server poll failed", error);
    actualizarTiemposServidores();
  } finally {
    pollServidoresEnCurso = false;
  }
}

/** Actualiza solo los textos “X min ago” sin recrear las cards. */
function actualizarTiemposServidores() {
  if (!listaServidores) {
    return;
  }
  const nodos = listaServidores.querySelectorAll(".server-played[data-played-at]");
  for (const nodo of nodos) {
    if (nodo.getAttribute("data-playing") === "1") {
      nodo.textContent = "Playing now";
      continue;
    }
    const ts = Number(nodo.getAttribute("data-played-at"));
    if (!ts) {
      continue;
    }
    nodo.textContent = textoJugado(ts);
  }
}

window.setInterval(revisarServidoresDesdeJuego, 15000);

// ---------- 3b) Last News ----------

// Two news banners side by side — drop images as assets/news-1.jpg and news-2.jpg
const noticias = [
  {
    tag: "Launcher",
    titulo: "Null Client 0.1",
    imagen: "assets/news-1.jpg",
  },
  {
    tag: "UI",
    titulo: "Last Servers",
    imagen: "assets/news-2.jpg",
  },
];

const listaNoticias = document.getElementById("listaNoticias");

function pintarNoticias() {
  if (!listaNoticias) {
    return;
  }

  listaNoticias.innerHTML = "";

  for (const nota of noticias) {
    const item = document.createElement("article");
    item.className = "news-item card-lift";
    item.innerHTML =
      '<img class="news-img" src="' +
      nota.imagen +
      '" alt="" onerror="this.classList.add(\'missing\')" />' +
      '<div class="news-caption">' +
      '<span class="news-tag">' +
      nota.tag +
      "</span>" +
      "<b>" +
      nota.titulo +
      "</b>" +
      "</div>";
    listaNoticias.appendChild(item);
  }
}

pintarNoticias();

// ---------- 4) Menú de versiones ----------

function pintarMenuVersiones() {
  versionMenu.innerHTML = "";

  for (const version of versiones) {
    const btn = document.createElement("button");
    btn.type = "button";

    if (versionElegida && versionElegida.id === version.id) {
      btn.classList.add("is-current");
    }

    btn.innerHTML =
      "<span><b>" +
      version.label +
      "</b><small>" +
      version.meta +
      "</small></span><em>" +
      version.tag +
      "</em>";

    btn.addEventListener("click", function () {
      elegirVersion(version);
    });

    versionMenu.appendChild(btn);
  }
}

function elegirVersion(version, opciones) {
  const instantaneo = opciones && opciones.instantaneo;
  versionElegida = version;
  versionLabel.textContent = version.label;
  tituloVersion.textContent = version.label;
  metaVersion.textContent = version.meta;
  estado.textContent = "Ready to play";
  guardarVersionId(version.id);

  if (instantaneo) {
    // Al abrir el launcher: hero sin animación
    if (heroMedia) {
      if (version.hero) {
        heroMedia.style.setProperty("--hero-image", 'url("' + version.hero + '")');
      } else {
        heroMedia.style.removeProperty("--hero-image");
      }
    }
  } else {
    actualizarHero(version);
  }

  cerrarMenuVersion();
  pintarMenuVersiones();
}

function restaurarUltimaVersion(idGuardado) {
  let id = idGuardado;
  if (!id) {
    try {
      id = localStorage.getItem(CLAVE_VERSION);
    } catch (error) {
      id = null;
    }
  }
  if (!id) {
    return;
  }
  let encontrada = null;
  for (const version of versiones) {
    if (version.id === id) {
      encontrada = version;
      break;
    }
  }
  if (encontrada) {
    elegirVersion(encontrada, { instantaneo: true });
  }
}

const DEMOS_VIEJOS = {
  "mc.hypixel.net": true,
  "play.minesplash.net": true,
  "play.cubecraft.net": true,
  "127.0.0.1": true,
};

function filtrarDemos(lista) {
  return lista.filter(function (s) {
    return !s.address || !DEMOS_VIEJOS[String(s.address).toLowerCase()];
  });
}

/** Carga servidores + versión desde disco (o localStorage). */
async function cargarEstadoGuardado() {
  let desdeDisco = null;

  if (window.nullClient && window.nullClient.cargarAjustes) {
    try {
      desdeDisco = await window.nullClient.cargarAjustes();
    } catch (error) {
      console.error("No se pudieron cargar ajustes:", error);
    }
  }

  if (desdeDisco && Array.isArray(desdeDisco.lastServers)) {
    servidoresRecientes = filtrarDemos(normalizarListaServidores(desdeDisco.lastServers));
  } else {
    try {
      const raw = localStorage.getItem(CLAVE_SERVIDORES);
      const listaLocal = raw ? normalizarListaServidores(JSON.parse(raw)) : [];
      servidoresRecientes = filtrarDemos(listaLocal);
    } catch (error) {
      servidoresRecientes = [];
    }
  }

  // Sin selección visual al abrir
  servidorSeleccionado = null;
  pintarServidores();

  const versionId = (desdeDisco && desdeDisco.lastVersion) || null;
  restaurarUltimaVersion(versionId);
  ajustesListos = true;

  // Primera pasada inmediata al log / servers.dat / iconos
  await revisarServidoresDesdeJuego();
}

// Cambia la imagen del hero con un fade suave
function actualizarHero(version) {
  if (!heroMedia) {
    return;
  }

  // 1) Apaga un poco la imagen actual
  heroMedia.classList.add("is-switching");

  // 2) A mitad del fade, cambia la url y vuelve a mostrar
  window.setTimeout(function () {
    if (version.hero) {
      heroMedia.style.setProperty("--hero-image", 'url("' + version.hero + '")');
    } else {
      heroMedia.style.removeProperty("--hero-image");
    }
    heroMedia.classList.remove("is-switching");
  }, 220);
}

function abrirMenuVersion() {
  menuAbierto = true;
  versionMenu.classList.remove("hidden");
  versionBtn.classList.add("is-open");
}

function cerrarMenuVersion() {
  menuAbierto = false;
  versionMenu.classList.add("hidden");
  versionBtn.classList.remove("is-open");
}

versionBtn.addEventListener("click", function (evento) {
  evento.stopPropagation();
  if (menuAbierto) {
    cerrarMenuVersion();
  } else {
    abrirMenuVersion();
  }
});

// Clic fuera cierra el menú
document.addEventListener("click", function () {
  if (menuAbierto) {
    cerrarMenuVersion();
  }
});

pintarMenuVersiones();
cargarEstadoGuardado();

// ---------- 3c) Cuenta premium ----------

const capaLogin = document.getElementById("loginLayer");
const loginIdle = document.getElementById("loginIdle");
const loginCode = document.getElementById("loginCode");
const loginError = document.getElementById("loginError");
const loginUserCode = document.getElementById("loginUserCode");
const loginStatus = document.getElementById("loginStatus");
const loginSalir = document.getElementById("loginSalir");
const puntoCuenta = document.getElementById("puntoCuenta");
const planJugador = document.getElementById("planJugador");
const selloCuenta = document.getElementById("selloCuenta");
const avatarJugador = document.getElementById("avatarJugador");
let loginPoll = null;
let enlaceMicrosoft = "https://www.microsoft.com/link";
let cuentaActual = null;

function pararPollLogin() {
  if (loginPoll) {
    clearInterval(loginPoll);
    loginPoll = null;
  }
}

function mostrarErrorLogin(texto) {
  if (!loginError) {
    return;
  }
  loginError.textContent = texto;
  loginError.classList.remove("hidden");
}

function pintarCuenta(perfil) {
  cuentaActual = perfil;
  if (nombreJugadorEl) {
    nombreJugadorEl.textContent = perfil ? perfil.name : "Sign in";
  }
  if (planJugador) {
    planJugador.textContent = perfil ? "Premium · Microsoft" : "Microsoft account";
  }
  if (selloCuenta) {
    selloCuenta.classList.toggle("hidden", !perfil);
  }
  if (puntoCuenta) {
    puntoCuenta.classList.toggle("online", !!perfil);
    puntoCuenta.classList.toggle("offline", !perfil);
  }
  if (avatarJugador) {
    if (perfil && perfil.uuid) {
      avatarJugador.classList.remove("missing");
      avatarJugador.src =
        "https://crafatar.com/avatars/" + perfil.uuid + "?size=32&overlay";
    } else {
      avatarJugador.src = "assets/avatar.png";
    }
  }
  if (loginSalir) {
    loginSalir.classList.toggle("hidden", !perfil);
  }
}

function abrirLogin() {
  if (!capaLogin) {
    return;
  }
  pararPollLogin();
  if (loginError) {
    loginError.classList.add("hidden");
  }
  if (loginCode) {
    loginCode.classList.add("hidden");
  }
  if (loginIdle) {
    loginIdle.classList.remove("hidden");
  }
  capaLogin.classList.remove("hidden");
}

function cerrarLogin() {
  pararPollLogin();
  if (capaLogin) {
    capaLogin.classList.add("hidden");
  }
}

async function cargarSesion() {
  if (!apiElectron || !apiElectron.sesionActual) {
    pintarCuenta(null);
    return;
  }
  try {
    const estado = await apiElectron.sesionActual();
    pintarCuenta(estado && estado.profile ? estado.profile : null);
  } catch (error) {
    pintarCuenta(null);
  }
}

document.getElementById("cuentaBtn").addEventListener("click", function () {
  abrirLogin();
});

document.getElementById("loginClose").addEventListener("click", function () {
  cerrarLogin();
});

document.getElementById("loginStart").addEventListener("click", async function () {
  if (!apiElectron || !apiElectron.iniciarSesion) {
    mostrarErrorLogin("Abre el launcher con npm start para iniciar sesión.");
    return;
  }
  if (loginError) {
    loginError.classList.add("hidden");
  }
  loginStatus.textContent = "Pidiendo código a Microsoft…";
  try {
    const inicio = await apiElectron.iniciarSesion();
    if (!inicio || !inicio.ok) {
      throw new Error((inicio && inicio.error) || "No se pudo empezar el login.");
    }
    enlaceMicrosoft = inicio.verificationUri || enlaceMicrosoft;
    loginUserCode.textContent = inicio.userCode || "----";
    loginIdle.classList.add("hidden");
    loginCode.classList.remove("hidden");
    loginStatus.textContent = "Esperando a que confirmes…";
    pararPollLogin();
    loginPoll = setInterval(async function () {
      try {
        const consulta = await apiElectron.consultarSesion(inicio.loginId);
        if (!consulta || consulta.status === "pending") {
          return;
        }
        pararPollLogin();
        if (consulta.status === "ready" && consulta.profile) {
          pintarCuenta(consulta.profile);
          cerrarLogin();
          estado.textContent = "Signed in as " + consulta.profile.name;
          return;
        }
        mostrarErrorLogin(consulta.error || "No se pudo iniciar sesión.");
      } catch (error) {
        pararPollLogin();
        mostrarErrorLogin(error.message || "No se pudo consultar el login.");
      }
    }, 2000);
  } catch (error) {
    mostrarErrorLogin(error.message || "No se pudo empezar el login.");
  }
});

document.getElementById("loginOpen").addEventListener("click", function () {
  if (apiElectron && apiElectron.abrirEnlace) {
    apiElectron.abrirEnlace(enlaceMicrosoft);
  } else {
    window.open(enlaceMicrosoft, "_blank", "noopener");
  }
});

document.getElementById("loginSalir").addEventListener("click", async function () {
  if (apiElectron && apiElectron.cerrarSesion) {
    await apiElectron.cerrarSesion();
  }
  pintarCuenta(null);
  cerrarLogin();
});

// ---------- 4) Play / Stop ----------

const nombreJugadorEl = document.getElementById("nombreJugador");
const apiElectron = window.nullClient;
cargarSesion();

botonPlay.addEventListener("click", async function () {
  if (lanzando) {
    return;
  }

  if (playLabel.textContent === "PLAY" || !botonPlay.classList.contains("is-stop")) {
    if (versionElegida === null) {
      estado.textContent = "Choose a version first";
      return;
    }

    // El PLAY grande también actualiza Last Servers si hay uno seleccionado
    if (servidorSeleccionado) {
      await registrarServidorJugado(servidorSeleccionado);
    }

    lanzarJuegoReal();
  } else {
    detener();
  }
});

function actualizarBarra(pct, texto) {
  launchFill.style.width = pct + "%";
  launchPct.textContent = pct + "%";
  if (texto) {
    launchTexto.textContent = texto;
  }
}

function marcarEnJuego() {
  lanzando = false;
  botonPlay.classList.remove("is-busy");
  ponerModoStop();
  estado.textContent = "In game · " + (versionElegida ? versionElegida.label : "");
  barraLanzamiento.classList.add("hidden");
  launchFill.style.width = "0%";
}

function marcarListoTrasCerrar() {
  lanzando = false;
  botonPlay.classList.remove("is-busy");
  ponerModoPlay();
  estado.textContent = "Ready to play";
  barraLanzamiento.classList.add("hidden");
  launchFill.style.width = "0%";
}

async function lanzarJuegoReal() {
  // Sin Electron: el login premium vive en la app de escritorio
  if (!apiElectron || !apiElectron.esElectron || !apiElectron.lanzarJuego) {
    abrirLogin();
    return;
  }

  if (apiElectron.sesionActual) {
    try {
      const sesion = await apiElectron.sesionActual();
      if (!sesion || !sesion.profile) {
        abrirLogin();
        estado.textContent = "Sign in with Microsoft to play";
        return;
      }
    } catch (error) {
      abrirLogin();
      return;
    }
  }

  // Evitar segundo launch si Minecraft ya corre
  if (apiElectron.estadoJuego) {
    try {
      const st = await apiElectron.estadoJuego();
      if (st && st.corriendo) {
        estado.textContent = "Game already running — press STOP first";
        marcarEnJuego();
        return;
      }
    } catch (error) {
      /* ignore */
    }
  }

  lanzando = true;
  botonPlay.classList.add("is-busy");
  botonPlay.classList.remove("is-stop");
  barraLanzamiento.classList.remove("hidden");
  playLabel.textContent = "...";
  estado.textContent = "Starting " + versionElegida.label + "...";
  actualizarBarra(1, "Preparing…");

  const jugador = nombreJugadorEl ? nombreJugadorEl.textContent.trim() : "Player";

  try {
    const optsLanzamiento = {
      versionId: versionElegida.id,
      jugador: jugador,
    };

    if (servidorSeleccionado && servidorSeleccionado.address) {
      optsLanzamiento.serverAddress = servidorSeleccionado.address;
      if (servidorSeleccionado.port) {
        optsLanzamiento.serverPort = servidorSeleccionado.port;
      }
    }

    const resultado = await apiElectron.lanzarJuego(optsLanzamiento);

    if (!resultado || !resultado.ok) {
      if (resultado && resultado.needsLogin) {
        lanzando = false;
        botonPlay.classList.remove("is-busy");
        barraLanzamiento.classList.add("hidden");
        ponerModoPlay();
        estado.textContent = resultado.error || "Sign in with Microsoft to play";
        abrirLogin();
        return;
      }
      throw new Error((resultado && resultado.error) || "Launch failed");
    }

    marcarEnJuego();
  } catch (error) {
    const mensaje = error && error.message ? error.message : String(error);
    lanzando = false;
    botonPlay.classList.remove("is-busy");
    barraLanzamiento.classList.add("hidden");

    // Si el juego sigue abierto, NO volver a PLAY (bug del botón blanco)
    const yaCorria = /already running/i.test(mensaje);
    if (yaCorria) {
      marcarEnJuego();
      estado.textContent = "Game already running — press STOP first";
      return;
    }

    ponerModoPlay();
    estado.textContent = "Launch error: " + mensaje;
  }
}

function simularLanzamiento() {
  lanzando = true;
  botonPlay.classList.add("is-busy");
  barraLanzamiento.classList.remove("hidden");
  estado.textContent = "Starting " + versionElegida.label + "...";
  playLabel.textContent = "...";

  let pct = 0;
  const pasos = [
    "Loading NullCore…",
    "Checking Java…",
    "Preparing libs…",
    "Launching game…",
  ];

  const timer = setInterval(function () {
    pct += 8;
    if (pct > 100) {
      pct = 100;
    }

    actualizarBarra(pct, pasos[Math.min(Math.floor(pct / 25), pasos.length - 1)]);

    if (pct >= 100) {
      clearInterval(timer);
      marcarEnJuego();
    }
  }, 120);
}

function detener() {
  if (apiElectron && apiElectron.detenerJuego) {
    apiElectron.detenerJuego();
  }
  marcarListoTrasCerrar();
  estado.textContent = "Stopped";
}

// Progreso / cierre desde Electron
if (apiElectron && apiElectron.esElectron) {
  if (apiElectron.onProgresoJuego) {
    apiElectron.onProgresoJuego(function (datos) {
      if (!datos) {
        return;
      }
      barraLanzamiento.classList.remove("hidden");
      actualizarBarra(datos.pct || 0, datos.texto);
      if (datos.texto) {
        estado.textContent = datos.texto;
      }
    });
  }
  if (apiElectron.onJuegoIniciado) {
    apiElectron.onJuegoIniciado(function () {
      marcarEnJuego();
    });
  }
  if (apiElectron.onJuegoCerrado) {
    apiElectron.onJuegoCerrado(function () {
      marcarListoTrasCerrar();
    });
  }
}

// ---------- 5) Navegación de pestañas ----------

const vistas = {
  inicio: document.getElementById("vistaInicio"),
  mods: document.getElementById("vistaMods"),
  perfiles: document.getElementById("vistaPerfiles"),
  cosmeticos: document.getElementById("vistaCosmeticos"),
  ajustes: document.getElementById("vistaAjustes"),
};

nav.addEventListener("click", function (evento) {
  const btn = evento.target.closest(".nav-btn");
  if (!btn) {
    return;
  }

  const tab = btn.dataset.tab;

  // Quitar activo a todos
  const botones = nav.querySelectorAll(".nav-btn");
  for (const b of botones) {
    b.classList.remove("is-active");
  }
  btn.classList.add("is-active");

  // Ocultar todas las vistas
  for (const clave in vistas) {
    vistas[clave].classList.add("hidden");
  }

  // Mostrar la elegida
  if (vistas[tab]) {
    vistas[tab].classList.remove("hidden");
    // Reinicia la animación de entrada
    vistas[tab].classList.remove("view-fade");
    void vistas[tab].offsetWidth;
    vistas[tab].classList.add("view-fade");
  }
});

// ---------- 6) Controles de ventana (Electron o navegador) ----------

document.querySelectorAll("[data-win]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const accion = btn.dataset.win;
    const api = window.nullClient;

    // Si estamos en Electron, los botones controlan la ventana real
    if (api && api.esElectron) {
      if (accion === "min") {
        api.minimizar();
      } else if (accion === "close") {
        api.cerrar();
      }
    }
  });
});

// Si el vídeo del hero no carga, lo ocultamos para no ensuciar la consola visualmente
const heroVideo = document.querySelector(".hero-video");
if (heroVideo) {
  heroVideo.addEventListener("error", function () {
    heroVideo.style.display = "none";
  });
}
