const Sequelize = require('sequelize');

//? Very simple database since nothing too crazy is being stored.
const opdb = new Sequelize({
    dialect: 'sqlite',
    logging: false,
    storage: './db.sqlite'
});

const OverPatchDB = opdb.define('OverwatchPatch', {
    patch_date: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

opdb.init = async () => {
    console.log('[SQLite] Connected to opdb');
    await opdb.authenticate();
    await OverPatchDB.sync();
};

module.exports = { opdb, OverPatchDB };