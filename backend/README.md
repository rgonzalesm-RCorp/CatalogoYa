# Backend CatalogosYa

Backend en Node.js + Express con SQL Server, Sequelize, JWT, Swagger, Google Identity y Cloudinary.

## Inicio rapido

```bash
npm install
cp .env.example .env
npm start
```

## Variables

Revisa [../README.md](../README.md) para la lista completa de variables y el flujo de instalacion.

- `API_BODY_LIMIT=15mb`: tamano maximo del body JSON/urlencoded. Sube este valor si envias logo y banner en base64.

## Scripts

```bash
npm start
npm run dev
```

## Migracion automatica

Al iniciar la API se ejecuta una sincronizacion del esquema con Sequelize antes de levantar el servidor.

Si la base no conecta o la sincronizacion falla, la API no se levanta.

- `DB_AUTO_MIGRATE=true`: habilita la migracion automatica al arranque.
- `DB_MIGRATE_ALTER=false`: si se cambia a `true`, Sequelize intenta ajustar tablas existentes.
- `DB_MIGRATE_FORCE=false`: si se cambia a `true`, recrea tablas y puede borrar datos.

## Documentacion API

- Health: `GET /api/health`
- Swagger: `GET /api/docs`
