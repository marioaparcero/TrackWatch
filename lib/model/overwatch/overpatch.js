const Sequelize = require('sequelize');

class Patch extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            patch_date: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, {
            sequelize: sequelize,
            modelName: 'Patch',
            tableName: 'OW_Patch'
        });
    }

    static associate(db) {}
}

module.exports = Patch;