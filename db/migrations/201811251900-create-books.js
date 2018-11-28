'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Books', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: Sequelize.STRING(1024),
            authors: Sequelize.JSON,
            publisher: Sequelize.STRING,
            publicationDate: Sequelize.DATE,
            subjects: Sequelize.JSON,
            languages: Sequelize.JSON,
            licenseRights: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        }, {
          charset: 'utf8',
          collate: 'utf8_unicode_ci'
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Books');
    }
};