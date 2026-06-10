const defineCategoria = require('./categoria.model');
const defineProducto = require('./producto.model');
const defineProductoImagen = require('./producto-imagen.model');
const defineProductoTalla = require('./producto-talla.model');
const defineTienda = require('./tienda.model');
const defineUsuario = require('./usuario.model');

const RELATION_OPTIONS = {
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE',
};

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
    ...RELATION_OPTIONS,
  });
  Tienda.belongsTo(Usuario, {
    foreignKey: 'UsuarioID',
    as: 'Usuario',
    ...RELATION_OPTIONS,
  });

  Tienda.hasMany(Categoria, {
    foreignKey: 'TiendaID',
    as: 'Categorias',
    ...RELATION_OPTIONS,
  });
  Categoria.belongsTo(Tienda, {
    foreignKey: 'TiendaID',
    as: 'Tienda',
    ...RELATION_OPTIONS,
  });

  Tienda.hasMany(Producto, {
    foreignKey: 'TiendaID',
    as: 'Productos',
    ...RELATION_OPTIONS,
  });
  Producto.belongsTo(Tienda, {
    foreignKey: 'TiendaID',
    as: 'Tienda',
    ...RELATION_OPTIONS,
  });

  Categoria.hasMany(Producto, {
    foreignKey: 'CategoriaID',
    as: 'Productos',
    ...RELATION_OPTIONS,
  });
  Producto.belongsTo(Categoria, {
    foreignKey: 'CategoriaID',
    as: 'Categoria',
    ...RELATION_OPTIONS,
  });

  Producto.hasMany(ProductoImagen, {
    foreignKey: 'ProductoID',
    as: 'Imagenes',
    ...RELATION_OPTIONS,
  });
  ProductoImagen.belongsTo(Producto, {
    foreignKey: 'ProductoID',
    as: 'Producto',
    ...RELATION_OPTIONS,
  });

  Producto.hasMany(ProductoTalla, {
    foreignKey: 'ProductoID',
    as: 'Tallas',
    ...RELATION_OPTIONS,
  });
  ProductoTalla.belongsTo(Producto, {
    foreignKey: 'ProductoID',
    as: 'Producto',
    ...RELATION_OPTIONS,
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
