const mongoose = require("mongoose");
const { Reserva } = require("../modelos/reserva");

// Convierte un documento de MongoDB en un objeto simple para las vistas
// y para la API. El _id (ObjectId) se expone como texto en el campo id.
function representarReserva(documento) {
  return {
    id: documento._id.toString(),
    estudiante: documento.estudiante,
    email: documento.email,
    sala: documento.sala,
    fecha: documento.fecha,
    turno: documento.turno,
    personas: documento.personas,
    estado: documento.estado,
  };
}

// Comprueba que el identificador tenga el formato de MongoDB.
// Si no, lanza un error y la función que la llamó no continúa.
function comprobarId(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    const error = new Error("Identificador inválido");
    error.codigo = "ID_INVALIDO";
    throw error;
  }
}

// Crea el servicio de reservas que trabaja con MongoDB.
// Todas sus funciones son async: consultar la base lleva tiempo.
function crearServicioReservasMongo() {
  // Devuelve todas las reservas, o solo las de una sala si se indica.
  async function listar(sala) {
    const filtro = {};

    // Si llegó un filtro, tiene que ser un texto no vacío.
    if (sala !== undefined) {
      if (typeof sala !== "string" || !sala.trim()) {
        const error = new Error("Sala inválida");
        error.codigo = "FILTRO_INVALIDO";
        throw error;
      }
      filtro.sala = sala.trim();
    }

    // lean() devuelve objetos simples en lugar de documentos de Mongoose.
    const documentos = await Reserva.find(filtro).lean();
    return documentos.map(representarReserva);
  }

  // Busca una reserva por su identificador. Devuelve null si no existe.
  async function obtenerPorId(id) {
    comprobarId(id);
    const documento = await Reserva.findById(id).lean();
    return documento ? representarReserva(documento) : null;
  }

  // Cuenta cuántas reservas hay guardadas en la base.
  async function contar() {
    return Reserva.countDocuments({});
  }

  // Guarda una reserva nueva. Se copian uno por uno los seis campos
  // permitidos: nunca se pasa req.body completo a Mongoose.
  // El estado queda en "pendiente" por el valor por defecto del modelo.
  async function crear(datos) {
    const documento = await Reserva.create({
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
    });

    return representarReserva(documento);
  }

  // PUT: reemplaza los siete campos editables de una reserva existente.
  // Devuelve la reserva modificada, o null si el id no existe.
  async function reemplazar(id, datos) {
    comprobarId(id);

    // Se copian explícitamente los siete campos editables.
    // Nunca se incluye _id ni se pasa el cuerpo entero de la solicitud.
    const reemplazo = {
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
      estado: datos.estado,
    };

    const documento = await Reserva.findOneAndReplace({ _id: id }, reemplazo, {
      runValidators: true, // aplica las reglas del esquema
      returnDocument: "after", // devuelve el documento ya modificado
      upsert: false, // si no existe, no lo crea
    });

    return documento ? representarReserva(documento) : null;
  }

  // PATCH: cambia solo los campos permitidos que llegaron (personas y estado).
  // Devuelve la reserva modificada, o null si el id no existe.
  async function actualizar(id, datos) {
    comprobarId(id);

    const cambios = {};
    for (const campo of ["personas", "estado"]) {
      // hasOwn detecta los campos que llegaron, aunque su valor sea falso.
      if (Object.hasOwn(datos, campo)) cambios[campo] = datos[campo];
    }

    // Una actualización sin ningún campo permitido no tiene sentido.
    if (Object.keys(cambios).length === 0) {
      const error = new Error("Actualización vacía");
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }

    const documento = await Reserva.findOneAndUpdate(
      { _id: id },
      { $set: cambios },
      { runValidators: true, returnDocument: "after", upsert: false },
    );

    return documento ? representarReserva(documento) : null;
  }

  // DELETE: elimina el documento de la base (borrado físico).
  // Devuelve true si se eliminó uno, false si el id no existía.
  async function eliminar(id) {
    comprobarId(id);
    const resultado = await Reserva.deleteOne({ _id: id });
    return resultado.deletedCount === 1;
  }

  return {
    listar,
    obtenerPorId,
    contar,
    crear,
    reemplazar,
    actualizar,
    eliminar,
  };
}

module.exports = { crearServicioReservasMongo };
