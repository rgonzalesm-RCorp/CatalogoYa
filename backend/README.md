# Backend

Backend base de `CatalogosYa` construido con Node.js, Express, Sequelize y SQL Server.

## Incluye

- Estructura `src/` separada por capas
- Conexion base a SQL Server con Sequelize y Tedious
- Endpoint `GET /api/health`
- Middleware global de errores
- Logs con Morgan
- Swagger disponible en `/api/docs`
- Runtime objetivo: Node.js 18 o superior

## Alcance actual

- Solo infraestructura base
- Sin modulos de negocio
- Independiente del frontend
