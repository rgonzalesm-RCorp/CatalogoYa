const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define(
  'Categoria',
  {
    CategoriaID: {
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
    tableName: 'Categoria',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'FechaCreacion',
    updatedAt: 'FechaModificacion',
  },
);
