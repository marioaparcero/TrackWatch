const Sequelize = require('sequelize');

//? Very simple database since nothing too crazy is being stored.
const osdb = new Sequelize({
    dialect: 'sqlite',
    logging: false,
    storage: './db.sqlite'
});

const OverShopDB = osdb.define('OverwatchShop', {
    shop_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    shop_items: {
        type: Sequelize.SMALLINT,
        allowNull: false
    },
    message_id: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

osdb.init = async () => {
    console.log('[SQLite] Connected to osdb');
    await osdb.authenticate();
    await OverShopDB.sync();
};

module.exports = { osdb, OverShopDB };