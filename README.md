# TP09 - Reservas de salas de estudio

## 1. De dónde partí

Para hacer este trabajo usé como base mi TP08 y lo copié en una carpeta nueva llamada `tp-09-salas-crud-mongodb`. De esa manera pude seguir trabajando sin modificar la entrega anterior.

## 2. Entorno utilizado

- Node.js: v24.19.0
- Express y Mongoose: versiones instaladas en el proyecto.
- Base de datos: MongoDB Atlas.
- Base: `reservas_salas_u9`.
- Colección: `reservas`.

Los datos para conectarme a la base están en el archivo `.env`, que no se incluye en la entrega.

## 3. Cómo ejecutar el proyecto

Primero hay que instalar las dependencias con:

`npm install`

Después, iniciar el servidor con:

`npm run start:local`

Para comprobar la conexión con MongoDB también está disponible el script:

`node --env-file=.env scripts/comprobar-conexion.js`

## 4. Qué hice en este TP

En el TP08 ya podía crear y consultar reservas. En este trabajo agregué las opciones para modificarlas y eliminarlas.

- **GET:** permite consultar las reservas.
- **POST:** permite crear una reserva nueva.
- **PUT:** permite reemplazar todos los datos de una reserva.
- **PATCH:** permite cambiar solamente la cantidad de personas o el estado.
- **DELETE:** permite eliminar una reserva.

Para probar estas funciones utilicé Postman y trabajé con la base de datos de MongoDB Atlas.

## 5. Validaciones

También probé qué pasa cuando se envían datos incorrectos. Por ejemplo, si falta un campo obligatorio en PUT o se intenta modificar un campo que no está permitido en PATCH, el servidor rechaza la solicitud.

La cantidad de personas debe estar entre 1 y 6, y el estado solo puede ser `pendiente` o `confirmada`.

Además, si se intenta consultar o modificar una reserva que no existe, el servidor devuelve el error correspondiente.

## 6. Pruebas

Durante las pruebas comprobé la creación de reservas, las consultas, los cambios con PUT y PATCH y el rechazo de datos incorrectos.



## 7. Qué pasa cuando se elimina una reserva

La eliminación es definitiva: el documento se borra de la colección de MongoDB. Si después se intenta consultar esa reserva por su ID, ya no debería aparecer y el servidor debe responder con un 404.

## 8. Conclusión

En este trabajo seguí trabajando sobre el TP08 y agregué las funciones para modificar y eliminar reservas. También hice pruebas para comprobar que los datos se guarden en MongoDB y que el servidor rechace las solicitudes incorrectas.

