const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { LeagueShop } = require('../lib/overwatch/leagueshop.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tienda-liga')
    .setDescription('Muestra la tienda de Overwatch League'),
  async execute(interaction) {
    const result = await LeagueShop('en-US');

    if (!result) return await interaction.reply({ content: "Se produjo un error al cargar datos.", ephemeral: true });

    try {
      // Embed
      const embed = {
        color: 0x60a5fa,
        title: `Información de la tienda de la Liga Overwatch`,
        fields: [
          {
            name: "Lista de productos",
            value: result.items,
          }
        ]
      };

      // Enlaces
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Ir a la tienda de la Liga Overwatch')
          .setStyle('Link')
          .setURL('https://overwatchleague.com/en-us/cosmetics'),
        );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
    catch (err) {
      await interaction.reply({ content: 'Se ha producido un error. Inténtalo de nuevo en unos minutos.', ephemeral: true });
    }
  },
};