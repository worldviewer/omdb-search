"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("FavoriteMovies", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      imdbID: {
        type: DataTypes.STRING
      },
      UserId: {
        type: DataTypes.INTEGER
      },
      rating: {
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("FavoriteMovies").done(done);
  }
};