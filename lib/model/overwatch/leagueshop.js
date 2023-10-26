const Sequelize = require('sequelize');

class LeagueShop extends Sequelize.Model {
    static init(sequelize) {
        super.init({
            shop_date: {
                type: Sequelize.STRING,
                allowNull: false
            },
            shop_items: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            message_id: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: 'LeagueShop',
            tableName: 'OW_LeagueShop'
        });
    }

    static associate(db) {}
}

module.exports = LeagueShop;