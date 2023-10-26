const Sequelize = require('sequelize');

//? Very simple database since nothing too crazy is being stored.
const sequelize = new Sequelize({
    dialect: 'sqlite',
    logging: false,
    storage: './database.db'
});

// Models
const db = {};
const Patch = require('./overwatch/overpatch');
const Shop = require('./overwatch/overshop');
const LeagueShop = require('./overwatch/leagueshop');

db.sequelize = sequelize;

db.Patch = Patch;
db.Shop = Shop;
db.LeagueShop = LeagueShop;

Patch.init(sequelize);
Shop.init(sequelize);
LeagueShop.init(sequelize);

Patch.associate(db);
Shop.associate(db);
LeagueShop.associate(db);

module.exports = db;