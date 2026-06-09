const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define(
  'ProductoTalla',
  {
    ProductoTallaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ProductoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Producto',
        key: 'ProductoID',
      },
    },
    Talla: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    Stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
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
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'ProductoTalla',
    freezeTableName: true,
    timestamps: false,
    validate: {
      rangoDePreciosValido() {
        if (Number(this.PrecioMayor) < Number(this.PrecioMenor)) {
          throw new Error('PrecioMayor no puede ser menor que PrecioMenor.');
        }
      },
    },
  },
);
