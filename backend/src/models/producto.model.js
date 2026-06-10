const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define(
  'Producto',
  {
    ProductoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TiendaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tienda',
        key: 'TiendaID',
      },
    },
    CategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categoria',
        key: 'CategoriaID',
      },
    },
    Nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    PrecioMenor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    PrecioMayor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    UsaTallas: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    FechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    FechaModificacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'Producto',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'FechaCreacion',
    updatedAt: 'FechaModificacion',
  },
);
