const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { OverShop } = require('../lib/overwatch/overshop.js');
const { formatHeroes } = require("../utils/emojis");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tienda')
    .setDescription('Tienda de cosméticos de Overwatch'),
  async execute(interaction) {
    // 1. Defer de inmediato para evitar que la interacción expire
    await interaction.deferReply({ ephemeral: true });

    try {
      const result = await OverShop();
      
      if (!result || !result.items) {
        return await interaction.editReply({ content: "Se produjo un error al cargar datos de la tienda." });
      }

      // Función interna para dividir texto si supera los 1024 caracteres
      const splitText = (text, limit = 1024) => {
        if (text.length <= limit) return [text];
        const lines = text.split('\n');
        let chunks = [];
        let currentChunk = "";

        for (const line of lines) {
          if ((currentChunk + line).length + 1 > limit) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = line + "\n";
          } else {
            currentChunk += line + "\n";
          }
        }
        if (currentChunk) chunks.push(currentChunk);
        return chunks;
      };

      // Formateamos los items con emojis
      const formattedItems = formatHeroes(result.items);
      const itemChunks = splitText(formattedItems);

      // Crear el Embed usando EmbedBuilder (más robusto)
      const embed = new EmbedBuilder()
        .setColor(0xfb923c)
        .setTitle(`Tienda de Overwatch <:overwatch:735558639603155027>`)
        .setAuthor({
          name: 'Overwatch',
          iconURL: 'https://images-ext-1.discordapp.net/external/4FuuxocaKy80RYDS27BxMgI_2KnunfafT0XMziE4vLY/https/cdn.patchbot.io/games/106/overwatch-2_1770906990_sm.webp?format=webp&width=240&height=240',
          url: 'https://eu.shop.battle.net/es-es/family/overwatch'
        })
        // .setFooter({ text: 'Datos obtenidos de la API oficial de Blizzard' })
        // .setTimestamp();

      // Añadimos los items destacados (repartidos en campos si son muchos)
      itemChunks.forEach((chunk, index) => {
        embed.addFields({
          name: index === 0 ? "<:decision:973254562154709112> Destacado" : "<:decision:973254562154709112> Destacado (continuación)",
          value: chunk || "No hay artículos disponibles"
        });
      });

      // Añadimos la sección de temporada (con control de longitud)
      if (result.season) {
        const seasonText = result.season.length > 1024 
          ? result.season.substring(0, 1021) + "..." 
          : result.season;
          
        embed.addFields({
          name: "<:afirmativo:991399660990255125> Paquete de temporada",
          value: seasonText
        });
      }

      // Botón de enlace
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Ir a la tienda de Overwatch')
          .setStyle('Link')
          .setURL('https://eu.shop.battle.net/es-es/family/overwatch'),
      );

      await interaction.editReply({ embeds: [embed], components: [row] });

    } catch (err) {
      // Imprimimos el error real en la consola para depurar
      console.error("Error en el comando tienda:", err);
      
      // Intentamos avisar al usuario
      if (interaction.deferred) {
        await interaction.editReply({ 
          content: 'Se ha producido un error al procesar la tienda. Inténtalo de nuevo en unos minutos.', 
          ephemeral: true 
        });
      }
    }
  },
};
