## Funcionamiento base de la API

ShipNow API es una aplicación backend construida con Node.js, Express y MongoDB.

En su estado base, la API permite trabajar con tres entidades principales:

* Usuarios
* Comercios
* Pedidos

La idea del proyecto es simular una API simple de logística/envíos.

Un usuario puede representar a un cliente.
Un comercio representa el lugar desde donde sale el pedido.
Un pedido representa una solicitud de envío asociada a un usuario y a un comercio.

### Flujo principal

El flujo básico de la API es:

1. Crear un usuario.
2. Crear un comercio.
3. Crear un pedido usando el ID del usuario y el ID del comercio.
4. Consultar los pedidos.
5. Actualizar el estado de un pedido.

El pedido contiene una lista de items, una dirección de entrega, un total calculado y un estado.

### Entidades principales

### User

Representa a un usuario dentro del sistema.

Campos principales:

```json
{
  "firstName": "Martina",
  "lastName": "Gómez",
  "email": "martina@test.com",
  "password": "123456",
  "role": "customer"
}
```

Roles disponibles:

```txt
admin
customer
store
```

En esta versión base, el usuario se usa principalmente como cliente del pedido.

---

### Store

Representa un comercio.

Campos principales:

```json
{
  "name": "Kiosco Centro",
  "address": "Av. Siempre Viva 742",
  "owner": "ID_DEL_USUARIO"
}
```

El campo `owner` guarda el ID de un usuario asociado al comercio.

---

### Order

Representa un pedido o envío.

Campos principales:

```json
{
  "customer": "ID_DEL_USUARIO",
  "store": "ID_DEL_COMERCIO",
  "deliveryAddress": "Av. Siempre Viva 742",
  "items": [
    {
      "name": "Caja mediana",
      "quantity": 2,
      "price": 1500
    }
  ]
}
```

Cuando se crea un pedido, la API calcula el total automáticamente recorriendo los items.

Ejemplo:

```txt
2 unidades x $1500 = $3000
```

El pedido se crea inicialmente con estado:

```txt
created
```

Estados posibles del pedido:

```txt
created
assigned
picked_up
in_transit
delivered
cancelled
```

### Endpoints disponibles

## Paginación, filtros y orden

Los tres listados principales (`GET /api/users`, `GET /api/stores`, `GET /api/orders`)
están paginados con `mongoose-paginate-v2`. **Nunca devuelven la colección completa.**

Parámetros comunes de query string:

| Parámetro | Default | Descripción |
| --- | --- | --- |
| `page` | `1` | Número de página (entero mayor a 0) |
| `limit` | `10` | Documentos por página. **Máximo 100**, aunque se pida más |
| `sort` | `createdAt:desc` | Orden con formato `campo:asc\|desc`, admite varios separados por coma |

Filtros propios de cada recurso:

| Endpoint | Filtros |
| --- | --- |
| `GET /api/users` | `role` (admin, customer, store), `email` |
| `GET /api/stores` | `isActive` (true/false), `owner` |
| `GET /api/orders` | `status`, `priority`, `customer`, `store` |

Un `page`, `limit`, `sort` o filtro inválido responde `400` con el formato de error
centralizado de la API.

Ejemplo:

```http
GET /api/orders?page=2&limit=20&status=delivered&sort=total:desc
```

Respuesta:

```json
{
  "status": "success",
  "message": "Lista de pedidos obtenida",
  "payload": [],
  "pagination": {
    "totalDocs": 42,
    "limit": 20,
    "totalPages": 3,
    "page": 2,
    "hasPrevPage": true,
    "hasNextPage": true,
    "prevPage": 1,
    "nextPage": 3
  }
}
```

El listado de pedidos además proyecta solo los campos necesarios de `customer` y
`store` en el populate, para no arrastrar documentos completos en cada item.



### Health check

Permite verificar que la API está funcionando.

```http
GET /health
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "API funcionando correctamente"
}
```

---

## Users

### Obtener usuarios

```http
GET /api/users
```

Paginado. Ver [Paginación, filtros y orden](#paginación-filtros-y-orden).

### Obtener usuario por ID

```http
GET /api/users/:uid
```

### Crear usuario

```http
POST /api/users
```

Body de ejemplo:

```json
{
  "firstName": "Martina",
  "lastName": "Gómez",
  "email": "martina@test.com",
  "password": "123456",
  "role": "customer"
}
```

### Actualizar usuario

```http
PUT /api/users/:uid
```

### Eliminar usuario

```http
DELETE /api/users/:uid
```

---

## Stores

### Obtener comercios

```http
GET /api/stores
```

Paginado. Ver [Paginación, filtros y orden](#paginación-filtros-y-orden).

### Obtener comercio por ID

```http
GET /api/stores/:sid
```

### Crear comercio

```http
POST /api/stores
```

Body de ejemplo:

```json
{
  "name": "Kiosco Centro",
  "address": "Av. Siempre Viva 742",
  "owner": "ID_DEL_USUARIO"
}
```

### Actualizar comercio

```http
PUT /api/stores/:sid
```

### Eliminar comercio

```http
DELETE /api/stores/:sid
```

---

## Orders

### Obtener pedidos

```http
GET /api/orders
```

Paginado. Ver [Paginación, filtros y orden](#paginación-filtros-y-orden).

### Obtener pedido por ID

```http
GET /api/orders/:oid
```

### Crear pedido

```http
POST /api/orders
```

Body de ejemplo:

```json
{
  "customer": "ID_DEL_USUARIO",
  "store": "ID_DEL_COMERCIO",
  "deliveryAddress": "Av. Siempre Viva 742",
  "items": [
    {
      "name": "Caja mediana",
      "quantity": 2,
      "price": 1500
    },
    {
      "name": "Sobre chico",
      "quantity": 1,
      "price": 800
    }
  ]
}
```

Respuesta esperada:

```json
{
  "status": "success",
  "payload": {
    "_id": "ID_DEL_PEDIDO",
    "customer": "ID_DEL_USUARIO",
    "store": "ID_DEL_COMERCIO",
    "items": [
      {
        "name": "Caja mediana",
        "quantity": 2,
        "price": 1500
      },
      {
        "name": "Sobre chico",
        "quantity": 1,
        "price": 800
      }
    ],
    "deliveryAddress": "Av. Siempre Viva 742",
    "total": 3800,
    "status": "created"
  }
}
```

### Actualizar estado del pedido

```http
PUT /api/orders/:oid/status
```

Body de ejemplo:

```json
{
  "status": "in_transit"
}
```

### Eliminar pedido

```http
DELETE /api/orders/:oid
```

---

## Formato general de respuestas

Las respuestas exitosas siguen una estructura simple:

```json
{
  "status": "success",
  "payload": {}
}
```

Las respuestas de error, en esta versión base, todavía se manejan de forma simple desde las rutas:

```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

Todos los errores pasan por el middleware centralizado `errorHandler`, que traduce los
códigos del diccionario de errores (`src/utils/errorDictionary.js`) al status HTTP
correspondiente. Los controladores nunca arman una respuesta de error a mano: delegan
con `next(error)`.

## Estado actual del proyecto

```txt
src/
├── app.js                 Configuración de Express, health check y montaje de routers
├── server.js              Arranque: conecta a Mongo y levanta el servidor
├── config/                env (validación), db, logger (Winston), cors
├── constants/             Enums de dominio (estados, roles, tipos de documento)
├── controllers/           Capa HTTP: leen req, delegan al service, responden
├── services/              Reglas de negocio, validaciones y filtros
├── repositories/          Acceso a datos (Mongoose)
├── models/                Schemas + plugin de paginación
├── middlewares/           errorHandler, notFoundHandler, logger, upload (Multer)
├── docs/                  Especificación OpenAPI servida por Swagger UI
├── mocks/                 Generadores de datos falsos (Faker)
└── utils/                 apiResponse, errorDictionary, pagination
test/                      Tests funcionales con Mocha, Chai y Supertest
```

Incorporado hasta el momento: arquitectura en capas, manejo centralizado de errores,
logger por entorno, Swagger, tests funcionales, carga de archivos con Multer,
paginación con filtros, validación de configuración al arranque y contenerización
con Docker.

---

# Producción y Docker

## Variables de entorno

La configuración vive en [`src/config/env.js`](src/config/env.js). **Ningún valor sensible
está escrito en el código**: todo se lee de variables de entorno.

| Variable | Obligatoria | Default | Descripción |
| --- | --- | --- | --- |
| `NODE_ENV` | **Sí** | — | Entorno de ejecución: `development`, `test` o `production` |
| `MONGODB_URI` | **Sí** | — | URI de conexión a MongoDB |
| `PORT` | No | `8080` | Puerto en el que escucha la API |
| `LOG_LEVEL` | No | según entorno | `fatal`, `error`, `warning`, `info`, `http`, `debug` |
| `CORS_ORIGINS` | No | vacío | Orígenes permitidos, separados por coma |
| `JWT_SECRET` | No | — | Secreto para firmar los JWT (módulo de autenticación) |

Si `LOG_LEVEL` no se define, se resuelve por entorno: `debug` en desarrollo, `info` en
producción y `error` en testing.

`CORS_ORIGINS` la consume el middleware de [`src/config/cors.js`](src/config/cors.js), que
deniega con `403` cualquier origen no listado. En producción, si la variable viene vacía,
no se permite ningún origen de navegador; en desarrollo se usa una lista de orígenes
locales por defecto (Vite, CRA, Live Server).

El archivo [`.env.example`](.env.example) está actualizado y sirve de plantilla; para los
tests existe [`.env.test.example`](.env.test.example).

### Validación al arranque (fail fast)

La app **no arranca si falta o es inválida** una variable crítica. `env.js` valida al
importarse, acumula todos los errores y corta el proceso con `exit(1)` antes de intentar
conectarse a la base o abrir el puerto:

```txt
[CONFIG] La aplicacion no puede iniciar por errores de configuracion:
  - Faltan variables de entorno obligatorias: MONGODB_URI
  - NODE_ENV='prod' no es valido. Valores permitidos: development, test, production

Revisa tu archivo .env tomando como referencia .env.example
```

Se valida: presencia de `MONGODB_URI` y `NODE_ENV`, que `NODE_ENV` sea uno de los tres
entornos válidos, que `PORT` sea un entero entre 1 y 65535, y que `LOG_LEVEL` sea un
nivel conocido. Se reportan **todos** los problemas juntos, no solo el primero.

## Correr la API localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el .env a partir de la plantilla y completar los valores
cp .env.example .env

# 3. Modo desarrollo (nodemon, recarga automática)
npm run dev

# 3b. Modo producción
npm start
```

La API queda en `http://localhost:8080` (o el `PORT` que hayas configurado).

## Correr los tests

Los tests son funcionales: levantan la app con Supertest y pegan contra una base real,
por lo que necesitan su propio `.env.test` apuntando a **una base distinta de la de
desarrollo** (el hook `afterEach` limpia todas las colecciones).

```bash
cp .env.test.example .env.test   # completar MONGODB_URI con una base de test
npm test
```

## Swagger

Con la API levantada, la documentación interactiva está en:

```txt
http://localhost:8080/api/docs
```

## Health check

```http
GET /health
```

```json
{
  "status": "success",
  "message": "API funcionando",
  "payload": {
    "status": "ok",
    "environment": "development",
    "uptime": 128,
    "timestamp": "2026-09-11T14:32:10.512Z",
    "database": "connected"
  }
}
```

Devuelve estado, entorno, uptime en segundos, timestamp y estado de la conexión a Mongo.
**No expone información sensible**: ni la URI de la base, ni credenciales, ni secretos,
ni versiones de dependencias.

## Criterio sobre endpoints internos

| Endpoint | Desarrollo / Testing | Producción |
| --- | --- | --- |
| `GET /health` | Disponible | **Disponible** |
| `GET /api/docs` (Swagger) | Disponible | Deshabilitado |
| `/api/mocks` | Disponible | Deshabilitado |

El criterio aplicado está implementado en [`src/app.js`](src/app.js): los routers de mocks
y Swagger se montan **solo si `envConfig.isProd` es falso**. El razonamiento es que los
mocks escriben datos en la base y la documentación describe la superficie completa de la
API, así que ninguno de los dos debería quedar expuesto en un entorno productivo real.
El health check sí queda siempre activo, porque es lo que consultan los orquestadores y
balanceadores para saber si el contenedor está vivo.

> Consecuencia práctica: si el contenedor se corre con `NODE_ENV=production`, Swagger
> **no** estará disponible. Para revisar la documentación dentro del contenedor hay que
> levantarlo con `NODE_ENV=development`, como muestra el ejemplo de más abajo.

## Construir la imagen

```bash
docker build -t shipnow-api .
```

La imagen parte de `node:22-alpine`, copia primero `package*.json` para aprovechar la
caché de capas en los rebuilds, instala dependencias con `npm ci` y expone el puerto de
la API.

## Ejecutar el contenedor

Las variables **no se hornean en la imagen**: se inyectan en tiempo de ejecución con un
archivo externo. Creá un `.env.docker` (que tampoco se versiona) a partir de `.env.example`:

```bash
docker run --rm -p 8080:8080 --env-file .env.docker --name shipnow shipnow-api
```

`MONGODB_URI` debe apuntar a una base accesible desde el contenedor. Ojo con esto: dentro
del contenedor, `localhost` es el propio contenedor, no tu máquina. Si Mongo corre en tu
host, usá `host.docker.internal`:

```bash
MONGODB_URI=mongodb://host.docker.internal:27017/shipnow
```

También se pueden pasar variables sueltas, que pisan lo del `--env-file`:

```bash
docker run --rm -p 8080:8080 --env-file .env.docker -e NODE_ENV=development shipnow-api
```

### Verificar que el contenedor funciona

```bash
# Health check
curl http://localhost:8080/health

# Endpoint principal, paginado
curl "http://localhost:8080/api/users?page=1&limit=5"

# Swagger (requiere haber levantado con NODE_ENV=development)
# Abrir en el navegador: http://localhost:8080/api/docs
```

## Puerto

La API escucha en el puerto definido por `PORT`, **8080** por defecto. El `Dockerfile`
declara ese mismo puerto con `EXPOSE`, y el mapeo `-p <host>:<contenedor>` del `docker run`
es lo que lo publica hacia afuera. Si cambiás `PORT` en el `--env-file`, tenés que ajustar
el lado derecho del mapeo: `-p 3000:3000` con `PORT=3000`.

## Archivos que no deben subirse al repositorio

Controlado por [`.gitignore`](.gitignore) y, para la imagen, por
[`.dockerignore`](.dockerignore):

| Archivo / carpeta | Motivo |
| --- | --- |
| `.env`, `.env.test`, `.env.docker` | Contienen credenciales reales. Solo se versionan los `.example` |
| `node_modules/` | Se reinstala con `npm ci`; copiarlo rompe binarios nativos |
| `logs/` | Se generan en ejecución |
| `uploads/` | Archivos subidos por los usuarios |
| `coverage/` | Reportes generados |
| `.git/` | Historial completo, innecesario dentro de la imagen |
| `npm-debug.log` | Temporal |

El `.dockerignore` además excluye `test/` y `README.md`, que no aportan nada a la imagen
final y solo la hacen más pesada.

## Logs

Los logs los maneja Winston ([`src/config/logger.js`](src/config/logger.js)) con niveles
propios (`fatal`, `error`, `warning`, `info`, `http`, `debug`).

- El nivel sale de `LOG_LEVEL`, con default por entorno: `debug` en desarrollo, `info` en
  producción y `error` en testing. En producción no se emiten logs de debug.
- Dos transportes: consola (siempre) y archivo `logs/error.log`, que **solo** registra
  errores, con rotación a 5 MB y un máximo de 5 archivos para que no crezca sin control.
- La carpeta `logs/` no se versiona ni se copia a la imagen. En un contenedor los logs de
  consola son lo que realmente importa, porque es lo que recoge `docker logs`; el archivo
  se pierde al eliminar el contenedor salvo que se monte un volumen.

## Uploads

La carga de archivos usa Multer ([`src/middlewares/upload.middleware.js`](src/middlewares/upload.middleware.js)):

- **Tamaño máximo**: 5 MB por archivo.
- **Tipos permitidos**: PDF, JPEG, PNG y WebP. Cualquier otro tipo es rechazado con
  `INVALID_FILE_TYPE` a través del manejador de errores centralizado.
- Los archivos se guardan con un nombre aleatorio (`crypto.randomUUID()`) conservando la
  extensión, para evitar colisiones y no exponer el nombre original en la ruta.
- Se separan por destino: `uploads/documents` para documentación de usuarios y
  `uploads/proofs` para comprobantes de entrega.
- La carpeta `uploads/` **está fuera del control de versiones y fuera de la imagen**.

> El disco local no es un almacenamiento permanente válido en producción: al recrear el
> contenedor, lo que haya en `uploads/` se pierde. Para un despliegue real hay que montar
> un volumen o, preferentemente, mover los archivos a un almacenamiento externo tipo S3 y
> guardar en Mongo solo la referencia. En Mongo ya se persiste la metadata del archivo
> (nombre original, ruta, mime type y tamaño), no el binario.
