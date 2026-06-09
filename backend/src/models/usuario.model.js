const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => sequelize.define(
  'Usuario',
  {
    UsuarioID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    Email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    GoogleID: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Foto: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    Estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'ACTIVO',
      validate: {
        notEmpty: true,
      },
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
    tableName: 'Usuario',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'FechaCreacion',
    updatedAt: 'FechaModificacion',
    indexes: [
      {
        name: 'UQ_Usuario_Email',
        unique: true,
        fields: ['Email'],
      },
      {
        name: 'UQ_Usuario_GoogleID',
        unique: true,
        fields: ['GoogleID'],
        where: {
          GoogleID: {
            [Op.ne]: null,
          },
        },
      },
    ],
  },
);
