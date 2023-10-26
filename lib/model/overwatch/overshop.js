const Sequelize = require('sequelize');

class Shop extends Sequelize.Model {
    static init(sequelize) {
        super.init({
            shop_id: {
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
            modelName: 'Shop',
            tableName: 'OW_Shop'
        });
    }

    static associate(db) {}
}

module.exports = Shop;