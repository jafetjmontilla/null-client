// Cliente HTTP de la API local. Solo lo usa el proceso principal.

const BASE = (process.env.NULL_API_URL || "http://204.168.187.112/null-api").replace(/\/$/, "");

async function pedir(ruta, opciones) {
  let respuesta;
  try {
    respuesta = await fetch(BASE + ruta, opciones);
  } catch (error) {
    const fallo = new Error(
      "No se pudo contactar la API de Null."
    );
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
