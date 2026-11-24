// Cliente HTTP de la API. Solo lo usa el proceso principal.
// La clave vive en null-api.local.json, que no se sube al repositorio.

const fs = require("fs");
const path = require("path");

function configuracionLocal() {
  try {
    const archivo = path.join(__dirname, "null-api.local.json");
    return JSON.parse(fs.readFileSync(archivo, "utf8"));
  } catch (error) {
    return {};
  }
}

function direccion() {
  const local = configuracionLocal();
  return (process.env.NULL_API_URL || local.url || "https://null.sistemasjaihom.com").replace(/\/$/, "");
}

function clave() {
  const local = configuracionLocal();
  return process.env.NULL_API_KEY || local.key || "";
}

async function pedir(ruta, opciones) {
  const CLAVE = clave();
  if (!CLAVE) {
    const fallo = new Error("Falta la clave de la API en launcher/null-api.local.json.");
    fallo.status = 0;
    throw fallo;
  }

  const opcionesConClave = Object.assign({}, opciones);
  opcionesConClave.headers = Object.assign(
    { "x-null-key": CLAVE },
    opciones && opciones.headers
  );

  let respuesta;
  try {
    respuesta = await fetch(direccion() + ruta, opcionesConClave);
  } catch (error) {
    const fallo = new Error("No se pudo contactar la API de Null.");
    fallo.status = 0;
    throw fallo;
  }

  const datos = await respuesta.json().catch(function () {
    return {};
  });

  if (!respuesta.ok) {
    const fallo = new Error(datos.error || "Error de la API (" + respuesta.status + ")");
    fallo.status = respuesta.status;
    throw fallo;
  }

  return datos;
}

function iniciarMicrosoft() {
  return pedir("/v1/auth/microsoft/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
    signal: AbortSignal.timeout(25000),
  });
}

function consultarMicrosoft(loginId) {
  return pedir("/v1/auth/microsoft/" + encodeURIComponent(loginId), {
    signal: AbortSignal.timeout(10000),
  });
}

function perfil(token) {
  return pedir("/v1/me", {
    headers: { authorization: "Bearer " + token },
    signal: AbortSignal.timeout(10000),
  });
}

function cerrarSesion(token) {
  return pedir("/v1/auth/logout", {
    method: "POST",
    headers: { authorization: "Bearer " + token },
    signal: AbortSignal.timeout(10000),
  });
}

function authorizationDeLanzamiento(token) {
  return pedir("/v1/launch/authorization", {
    method: "POST",
    headers: { authorization: "Bearer " + token },
    signal: AbortSignal.timeout(30000),
  });
}

module.exports = {
  iniciarMicrosoft,
  consultarMicrosoft,
  perfil,
  cerrarSesion,
  authorizationDeLanzamiento,
};
