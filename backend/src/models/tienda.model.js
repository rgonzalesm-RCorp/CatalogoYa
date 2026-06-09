const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define(
  'Tienda',
  {
    TiendaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    UsuarioID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'UsuarioID',
      },
    },
    Nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    Slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    TokenPublico: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    Logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    Portada: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    WhatsApp: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ColorPrincipal: {
      type: DataTypes.STRING(20),
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
    tableName: 'Tienda',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'FechaCreacion',
    updatedAt: 'FechaModificacion',
    indexes: [
      {
        name: 'UQ_Tienda_Slug',
        unique: true,
        fields: ['Slug'],
      },
      {
        name: 'UQ_Tienda_TokenPublico',
        unique: true,
        fields: ['TokenPublico'],
      },
    ],
  },
);
