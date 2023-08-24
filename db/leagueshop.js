const Sequelize = require('sequelize');

//? Very simple database since nothing too crazy is being stored.
const lgdb = new Sequelize({
    dialect: 'sqlite',
    logging: false,
    storage: './db.sqlite'
});

const LeagueShopDB = lgdb.define('OWLeagueShop', {
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

lgdb.init = async () => {
    console.log('[SQLite] Connected to lgdb');
    await lgdb.authenticate();
    await LeagueShopDB.sync();
};

module.exports = { lgdb, LeagueShopDB };