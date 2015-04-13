"use strict";
module.exports = function(sequelize, DataTypes) {
  var FavoriteMovie = sequelize.define("FavoriteMovie", {
    imdbID: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    rating: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.User);
      }
    }
  });
  return FavoriteMovie;
};