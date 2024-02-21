// Initialize
const fs = require('node:fs');
const path = require('node:path');
const Cron = require('node-cron');

const { sequelize } = require('./lib/model');

//const { LeagueShopCron } = require('./lib/overwatch/leagueshop.js');
const { OverShopCron } = require('./lib/overwatch/overshop.js');
const { OverPatchCron } = require('./lib/overwatch/overpatch.js');

// Config
const { token, clientId, guildId } = require("./config.json");

// Extract the required classes from the discord.js module
const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// Create Collection
client.commands = new Collection();

// Interaction
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Grab all the command files from the commands directory you created earlier
const commands = [];

for (const file of fs.readdirSync('./commands').filter(file => file.endsWith('.js'))) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

// and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async (c) => {
    // initialize db
    await sequelize.sync({ force: false })
      .then(() => {
        console.log('[DB] Connected to Database');
      })
      .catch((e) => {
        console.log('[DB] Failed to connect');
        console.error(e.message);
      });

    Cron.schedule('0-59/3 19-20 * * 2,4', async () => { // Every 3 minutes from 7-8 PM on Tuesday and Thursday
        await OverShopCron(c);
        //await LeagueShopCron(c);
    });

    Cron.schedule('1-4 * * * *', async () => { // Every 1-4 minutes. For each two minutes is '*/2'. For 30 seconds is '*/0,5 * * * *'
        await OverPatchCron(c);
    });

  console.log(`[Discord] Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);