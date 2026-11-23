// ============================================
// Null Client — lógica del launcher
// Léelo de arriba a abajo: primero datos, luego UI, luego eventos.
// ============================================

// ---------- 1) Datos ----------

const versiones = [
  {
    id: "1.21.11",
    label: "Fabric 1.21.11",
    meta: "NullCore · Sodium",
    tag: "Última",
    hero: "assets/hero-1.21.11.jpg",
  },
  {
    id: "1.19.2",
    label: "Fabric 1.19.2",
    meta: "SMP · Mods",
    tag: "SMP",
    hero: "assets/hero-1.19.2.jpg", // cuando tengas la imagen
  },
  {
    id: "1.8.9",
    label: "PvP 1.8.9",
    meta: "OptiFine · HitReg",
    tag: "Competitivo",
    hero: "assets/hero-1.8.9.jpg", // cuando tengas la imagen
  },
];

// Últimos 4 servidores jugados (el primero = el más reciente)
const servidoresRecientes = [
  { nombre: "Hypixel", ip: "mc.hypixel.net", icono: "assets/server-hypixel.png", iniciales: "HY", jugado: "Hoy" },
  { nombre: "MineSplash", ip: "play.minesplash.net", icono: "assets/server-minesplash.png", iniciales: "MS", jugado: "Ayer" },
  { nombre: "Cubecraft", ip: "play.cubecraft.net", icono: "assets/server-cubecraft.png", iniciales: "CC", jugado: "Hace 3 días" },
  { nombre: "Localhost", ip: "localhost", icono: "assets/server-local.png", iniciales: "LO", jugado: "Hace 1 sem." },
];

let versionElegida = null;
let menuAbierto = false;
let lanzando = false;

// ---------- 2) Elementos del HTML ----------

const botonPlay = document.getElementById("botonPlay");
const playLabel = document.getElementById("playLabel");
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
  listaServidores.innerHTML = "";

  for (const server of servidoresRecientes) {
    const card = document.createElement("article");
    card.className = "server card-lift";

    card.innerHTML =
      '<img class="fav" src="' +
      server.icono +
      '" alt="" onerror="this.classList.add(\'missing\')" />' +
      '<div class="fav-fallback" aria-hidden="true">' +
      server.iniciales +
      "</div>" +
      '<div class="server-text">' +
      "<b>" +
      server.nombre +
      "</b>" +
      "<small>" +
      server.ip +
      "</small>" +
      '<span class="server-played">' +
      server.jugado +
      "</span>" +
      "</div>" +
      '<div class="server-meta">' +
      '<button type="button" class="btn sm">PLAY</button>' +
      "</div>";

    listaServidores.appendChild(card);
  }
}

pintarServidores();

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

function elegirVersion(version) {
  versionElegida = version;
  versionLabel.textContent = version.label;
  tituloVersion.textContent = version.label;
  metaVersion.textContent = version.meta;
  estado.textContent = "Listo para jugar";
  actualizarHero(version);
  cerrarMenuVersion();
  pintarMenuVersiones();
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

// ---------- 4) Play / Detener ----------

botonPlay.addEventListener("click", function () {
  if (lanzando) {
    return;
  }

  if (playLabel.textContent === "PLAY") {
    if (versionElegida === null) {
      estado.textContent = "Elige una versión primero";
      return;
    }

    simularLanzamiento();
  } else {
    detener();
  }
});

function simularLanzamiento() {
  lanzando = true;
  botonPlay.classList.add("is-busy");
  barraLanzamiento.classList.remove("hidden");
  estado.textContent = "Iniciando " + versionElegida.label + "...";
  playLabel.textContent = "...";

  let pct = 0;
  const pasos = [
    "Cargando NullCore…",
    "Comprobando Java…",
    "Preparando libs…",
    "Arrancando juego…",
  ];

  const timer = setInterval(function () {
    pct += 8;
    if (pct > 100) {
      pct = 100;
    }

    launchFill.style.width = pct + "%";
    launchPct.textContent = pct + "%";
    launchTexto.textContent = pasos[Math.min(Math.floor(pct / 25), pasos.length - 1)];

    if (pct >= 100) {
      clearInterval(timer);
      lanzando = false;
      botonPlay.classList.remove("is-busy");
      playLabel.textContent = "DETENER";
      estado.textContent = "En juego · " + versionElegida.label;
      barraLanzamiento.classList.add("hidden");
      launchFill.style.width = "0%";
    }
  }, 120);
}

function detener() {
  playLabel.textContent = "PLAY";
  estado.textContent = "Apagado";
  barraLanzamiento.classList.add("hidden");
  launchFill.style.width = "0%";
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

// ---------- 6) Controles de ventana (por ahora solo visual) ----------

document.querySelectorAll("[data-win]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const accion = btn.dataset.win;
    if (accion === "max") {
      ventana.classList.toggle("is-max");
    }
    // min / close: cuando pasemos a Electron harán de verdad
  });
});

// Si el vídeo del hero no carga, lo ocultamos para no ensuciar la consola visualmente
const heroVideo = document.querySelector(".hero-video");
if (heroVideo) {
  heroVideo.addEventListener("error", function () {
    heroVideo.style.display = "none";
  });
}
