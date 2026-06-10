# CatalogosYa

CatalogosYa es un SaaS para gestionar catalogos online bajo un solo dominio: `catalogosYa.com`.

- Cada tienda publica su catalogo por `slug`.
- Ejemplo: `catalogosYa.com/tienda-rouss`
- No se usan subdominios.
- El backend y el frontend estan desacoplados.

## Stack

### Backend

- Node.js
- Express
- SQL Server
- Sequelize
- Tedious
- JWT
- Swagger
- Cloudinary
- Google Identity

### Frontend

- React
- Vite
- TailwindCSS
- React Router
- Axios
- SweetAlert2
- iziToast
- React Hook Form
- Lucide React

## Requisitos previos

- Node.js `18` o superior
- npm compatible con Node.js `18+`
- SQL Server accesible
- Credenciales de Google Identity Services
- Credenciales de Cloudinary

Importante:

- Si al ejecutar `npm start` o `npm run dev` aparece un error como `Unexpected token '??='`, el problema no es del proyecto sino de un runtime viejo de Node.js.
- Verifica que `node -v` y el `npm` que ejecuta tus scripts esten apuntando a Node.js `18+`.

## Estructura

```text
CatalogosYa/
├── backend/
└── frontend/
```

## Instalacion backend

```bash
cd backend
npm install
cp .env.example .env
```

Ajusta las variables de `.env` antes de iniciar.

### Variables backend

```env
PORT=3000
HOST=127.0.0.1
NODE_ENV=development
APP_NAME=CatalogosYa Backend
APP_URL=http://localhost:3000
CORS_ORIGIN=*

DB_HOST=localhost
DB_PORT=1433
DB_NAME=CatalogosYa
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
DB_LOGGING=false
DB_AUTO_MIGRATE=true
DB_MIGRATE_ALTER=false
DB_MIGRATE_FORCE=false

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Scripts backend

```bash
npm start
npm run dev
```

### Endpoints principales backend

- `GET /api/health`
- `POST /api/auth/google`
- `GET /api/auth/me`
- `GET /api/tiendas`
- `GET /api/tiendas/:id`
- `POST /api/tiendas`
- `PUT /api/tiendas/:id`
- `DELETE /api/tiendas/:id`
- `GET /api/tiendas/:tiendaId/categorias`
- `GET /api/categorias/:id`
- `POST /api/tiendas/:tiendaId/categorias`
- `PUT /api/categorias/:id`
- `DELETE /api/categorias/:id`
- `GET /api/tiendas/:tiendaId/productos`
- `GET /api/productos/:id`
- `POST /api/tiendas/:tiendaId/productos`
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`
- `GET /api/public/catalogo/:slug`
- `GET /api/docs`

## Instalacion frontend

```bash
cd frontend
npm install
cp .env.example .env
```

### Variables frontend

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=
```

### Scripts frontend

```bash
npm run dev
npm run build
npm run preview
```

### Rutas frontend

- `/login`
- `/admin`
- `/admin/tiendas`
- `/admin/tiendas/:id`
- `/admin/categorias`
- `/admin/productos`
- `/:slug`

## Flujo principal del sistema

1. El usuario entra a `/login` y se autentica con Google.
2. El frontend envia el `idToken` a `POST /api/auth/google`.
3. El backend valida Google, crea o actualiza el usuario y responde con JWT.
4. El frontend guarda el JWT en `localStorage`.
5. Las rutas privadas del admin usan el token automaticamente con Axios.
6. El usuario crea una tienda.
7. La tienda genera `slug` y `TokenPublico`.
8. El usuario administra categorias y productos solo dentro de sus tiendas.
9. Las imagenes se envian a Cloudinary y en SQL Server solo se guarda la URL.
10. El catalogo publico queda disponible por `GET /api/public/catalogo/:slug`.

## Migracion automatica al iniciar la API

Al arrancar el backend, la API intenta conectarse a SQL Server y ejecutar `sequelize.sync()` antes de abrir el puerto.

Si la conexion o la migracion fallan, la API no inicia. Eso evita dejar el backend arriba sin todas las tablas necesarias.

- `DB_AUTO_MIGRATE=true`: habilita la sincronizacion automatica del esquema.
- `DB_MIGRATE_ALTER=true`: ajusta tablas existentes para alinearlas con los modelos.
- `DB_MIGRATE_FORCE=true`: recrea tablas. Usar solo si quieres rehacer el esquema y perder datos.

Recomendacion:

- En desarrollo, puedes usar `DB_MIGRATE_ALTER=true` si estas iterando el modelo.
- En entornos con datos reales, manten `DB_MIGRATE_FORCE=false` y usa `DB_MIGRATE_ALTER` con cuidado.

## Reglas funcionales ya implementadas

- Las rutas privadas usan JWT.
- Las rutas publicas no requieren token.
- Cada usuario solo puede ver y administrar sus propias tiendas.
- Categorias y productos se filtran por tienda.
- El catalogo publico busca por `slug`.
- El catalogo publico no expone datos privados del duenio.
- El borrado de tiendas, categorias y productos es logico.

## Swagger

Swagger UI queda disponible en:

```text
http://localhost:3000/api/docs
```

## Validacion realizada en esta revision

- Backend: arranca y expone `GET /api/health` y `/api/docs`.
- Frontend: compila correctamente con `npm run build`.
- JWT: la proteccion de rutas privadas responde `401` sin token.
- Swagger: incluye auth, tiendas, categorias, productos, health y catalogo publico.
- Rutas publicas: se corrigio un bloqueo indebido de autenticacion sobre `health` y catalogo publico.

## Validaciones pendientes de entorno

Estas comprobaciones dependen de servicios externos configurados y no pudieron cerrarse por completo en este entorno sin credenciales reales o una base SQL Server activa:

- Conexion real a SQL Server
- Login real con Google
- CRUD real contra base de datos
- Subidas reales a Cloudinary
- Catalogo publico con datos persistidos

## Recomendacion de arranque

1. Levanta SQL Server.
2. Configura `backend/.env`.
3. Inicia el backend con `npm start`.
4. Configura `frontend/.env`.
5. Inicia el frontend con `npm run dev`.
6. Prueba el login con una cuenta Google autorizada.
7. Crea una tienda, luego categorias, luego productos.
8. Verifica el catalogo publico usando el `slug`.
