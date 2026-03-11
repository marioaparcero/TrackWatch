const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { OverShop } = require('../lib/overwatch/overshop.js');
const { formatHeroes } = require("../utils/emojis");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tienda')
    .setDescription('Tienda de cosméticos de Overwatch'),
  async execute(interaction) {
    const result = await OverShop();

    if (!result) return await interaction.reply({ content: "Se produjo un error al cargar datos.", ephemeral: true });

    try {
      await interaction.deferReply(); // Esto asegura que Discord sabe que está en progreso
      // Embed
      const embed = {
        color: 0xfb923c,
        title: `Información de la tienda de Overwatch <:overwatch:735558639603155027>`,
        fields: [
          {
            name: "<:decision:973254562154709112> Destacado", // Sugerencia
            value: formatHeroes(result.items), // Reemplazamos héroes por héroe+emoji
          },
          {
            name: "<:afirmativo:991399660990255125> Paquete de temporada",
            value: result.season,
            // value: formatHeroes(result.season), // Reemplazamos héroes por héroe+emoji
          }
        ]
      };

      // Enlaces
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Ir a la tienda de Overwatch')
          .setStyle('Link')
          .setURL('https://eu.shop.battle.net/es-es/family/overwatch'),
      );

      await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
    }
    catch (err) {
      await interaction.reply({ content: 'Se ha producido un error. Inténtalo de nuevo en unos minutos.', ephemeral: true });
    }
  },
};
