// Estados que acepta el esquema de reservas.
const estadosPermitidos = ["pendiente", "confirmada"];

// Campos que se pueden reemplazar con PUT (los siete editables).
const camposReemplazo = [
  "estudiante",
  "email",
  "sala",
  "fecha",
  "turno",
  "personas",
  "estado",
];

// Campos que se pueden cambiar con PATCH.
const camposActualizacion = ["personas", "estado"];

// Responde 400 con el mismo formato de error que usa el resto de la API.
function responderEntradaInvalida(res, errores) {
  return res.status(400).json({
    error: "Revisá los datos enviados.",
    errores,
  });
}

// Devuelve el texto sin espacios en los extremos.
// Si el valor no es un texto (número, booleano, arreglo, objeto), devuelve "".
function leerTexto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

// PUT: se ejecuta después de validarReserva, que ya comprobó los seis campos
// originales. Acá se controla estado y que no haya campos de más.
function validarReemplazoReserva(req, res, next) {
  const datos = req.body;
  const errores = [];

  const desconocidos = Object.keys(datos).filter(
    (campo) => !camposReemplazo.includes(campo),
  );

  if (desconocidos.length > 0) {
    errores.push("Hay campos que no se pueden editar.");
  }

  // El estado es obligatorio en PUT: no se completa con un valor por defecto.
  const estado = leerTexto(datos.estado);

  if (!estadosPermitidos.includes(estado)) {
    errores.push("El estado debe ser pendiente o confirmada.");
  }

  if (errores.length > 0) {
    return responderEntradaInvalida(res, errores);
  }

  // Los seis campos ya validados más el estado.
  req.cambiosValidos = { ...req.reservaValidada, estado };
  next();
}

// PATCH: valida un cuerpo parcial. Solo admite personas y estado.
function validarCambiosReserva(req, res, next) {
  const datos = req.body;

  // El cuerpo tiene que ser un objeto (no faltar, ni ser un arreglo).
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return responderEntradaInvalida(res, ["Enviá un objeto JSON."]);
  }

  const claves = Object.keys(datos);
  const errores = [];

  if (claves.length === 0) {
    errores.push("Enviá al menos un campo para actualizar.");
  }

  // Cualquier otro campo (sala, _id, $set, etc.) se rechaza.
  if (claves.some((campo) => !camposActualizacion.includes(campo))) {
    errores.push("Solo se pueden modificar personas y estado.");
  }

  const cambios = {};

  if (Object.hasOwn(datos, "personas")) {
    // Se acepta un número o un texto numérico no vacío.
    const recibido = datos.personas;
    const tipoValido =
      typeof recibido === "number" ||
      (typeof recibido === "string" && recibido.trim() !== "");
    const personas = tipoValido ? Number(recibido) : NaN;

    if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
      errores.push("La cantidad de personas debe ser un entero entre 1 y 6.");
    } else {
      cambios.personas = personas;
    }
  }

  if (Object.hasOwn(datos, "estado")) {
    const estado = leerTexto(datos.estado);

    if (!estadosPermitidos.includes(estado)) {
      errores.push("El estado debe ser pendiente o confirmada.");
    } else {
      cambios.estado = estado;
    }
  }

  if (errores.length > 0) {
    return responderEntradaInvalida(res, errores);
  }

  req.cambiosValidos = cambios;
  next();
}

module.exports = { validarReemplazoReserva, validarCambiosReserva };
