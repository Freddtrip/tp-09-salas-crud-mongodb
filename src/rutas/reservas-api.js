const express = require("express");

// La API usa la validación de reservas y las de PUT y PATCH.
const { validarReserva } = require("../middleware/reservas");
const {
  validarReemplazoReserva,
  validarCambiosReserva,
} = require("../middleware/cambios-reservas");

// Crea el router de la API JSON de reservas.
// Los caminos son relativos: la URL pública se forma al montar el router
// con app.use("/api/reservas", ...) en app.js.
function crearRouterReservasApi(controladorReservas) {
  const router = express.Router();

  // GET /api/reservas (acepta ?sala=Sala Norte para filtrar)
  router.get("/", controladorReservas.listarApi);

  // GET /api/reservas/:id
  router.get("/:id", controladorReservas.obtenerApi);

  // POST /api/reservas: primero valida y después crea.
  router.post("/", validarReserva, controladorReservas.crearApi);

  // PUT /api/reservas/:id: valida los seis campos, después estado, y reemplaza.
  router.put(
    "/:id",
    validarReserva,
    validarReemplazoReserva,
    controladorReservas.reemplazarApi,
  );

  // PATCH /api/reservas/:id: valida el cuerpo parcial y actualiza.
  router.patch(
    "/:id",
    validarCambiosReserva,
    controladorReservas.actualizarApi,
  );

  // DELETE /api/reservas/:id
  router.delete("/:id", controladorReservas.eliminarApi);

  return router;
}

module.exports = { crearRouterReservasApi };
