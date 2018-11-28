'use strict';
module.exports = (sequelize, DataTypes) => {
    let Book = sequelize.define('Book', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: DataTypes.STRING(1024),
        authors: DataTypes.JSON,
        publisher: DataTypes.STRING,
        publicationDate: DataTypes.DATE,
        subjects: DataTypes.JSON,
        languages: DataTypes.JSON,
        licenseRights: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });
    return Book;
};