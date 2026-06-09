const defineCategoria = require('./categoria.model');
const defineProducto = require('./producto.model');
const defineProductoImagen = require('./producto-imagen.model');
const defineProductoTalla = require('./producto-talla.model');
const defineTienda = require('./tienda.model');
const defineUsuario = require('./usuario.model');

const initializeModels = (sequelize) => {
  if (sequelize.models.Usuario) {
    return sequelize.models;
  }

  const Usuario = defineUsuario(sequelize);
  const Tienda = defineTienda(sequelize);
  const Categoria = defineCategoria(sequelize);
  const Producto = defineProducto(sequelize);
  const ProductoImagen = defineProductoImagen(sequelize);
  const ProductoTalla = defineProductoTalla(sequelize);

  Usuario.hasMany(Tienda, {
    foreignKey: 'UsuarioID',
    as: 'Tiendas',
  });
  Tienda.belongsTo(Usuario, {
    foreignKey: 'UsuarioID',
    as: 'Usuario',
  });

  Tienda.hasMany(Categoria, {
    foreignKey: 'TiendaID',
    as: 'Categorias',
  });
  Categoria.belongsTo(Tienda, {
    foreignKey: 'TiendaID',
    as: 'Tienda',
  });

  Tienda.hasMany(Producto, {
    foreignKey: 'TiendaID',
    as: 'Productos',
  });
  Producto.belongsTo(Tienda, {
    foreignKey: 'TiendaID',
    as: 'Tienda',
  });

  Categoria.hasMany(Producto, {
    foreignKey: 'CategoriaID',
    as: 'Productos',
  });
  Producto.belongsTo(Categoria, {
    foreignKey: 'CategoriaID',
    as: 'Categoria',
  });

  Producto.hasMany(ProductoImagen, {
    foreignKey: 'ProductoID',
    as: 'Imagenes',
  });
  ProductoImagen.belongsTo(Producto, {
    foreignKey: 'ProductoID',
    as: 'Producto',
  });

  Producto.hasMany(ProductoTalla, {
    foreignKey: 'ProductoID',
    as: 'Tallas',
  });
  ProductoTalla.belongsTo(Producto, {
    foreignKey: 'ProductoID',
    as: 'Producto',
  });

  return {
    Usuario,
    Tienda,
    Categoria,
    Producto,
    ProductoImagen,
    ProductoTalla,
  };
};

module.exports = { initializeModels };
