const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { OverShop } = require('../lib/overwatch/overshop.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tienda')
    .setDescription('Tienda de cosméticos de Overwatch 2'),
  async execute(interaction) {
    const result = await OverShop();

    if (!result) return await interaction.reply({ content: "Se produjo un error al cargar datos.", ephemeral: true });

    try {
      // Embed
      const embed = {
        color: 0xfb923c,
        title: `Información de la tienda de Overwatch 2 <:overwatch:735558639603155027>`,
        fields: [
          {
            name: "<:decision:973254562154709112> Destacado", //Sugerencia
            value: result.items,
          },
          {
            name: "<:afirmativo:991399660990255125> Paquete de temporada",
            value: result.season,
          }
        ]
      };

      // Enlaces
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Ir a la tienda de Overwatch 2')
          .setStyle('Link')
          .setURL('https://eu.shop.battle.net/es-es/family/overwatch'),
        );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
    catch (err) {
      await interaction.reply({ content: 'Se ha producido un error. Inténtalo de nuevo en unos minutos.', ephemeral: true });
    }
  },
};