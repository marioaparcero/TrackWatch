const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { OverShop } = require('../lib/overwatch/overshop.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tienda')
    .setDescription('Tienda de cosméticos de Overwatch 2'),
  async execute(interaction) {
    const result = await OverShop();

    if (!result) return await interaction.reply({ content: "Se produjo un error al cargar datos.", ephemeral: true });

    const emojis = {
      'D.Va': '<:dva:735555762734104726>',
      'Roadhog': '<:roadhog:735555506940412044>',
      'Zarya': '<:zarya:735555560245559347>',
      'Hanzo': '<:hanzo:817773638647676928>',
      'Junkrat': '<:junkrat:735555216363094098>',
      'Soldado: 76': '<:soldado76:735555717234294865>',
      'Tracer': '<:tracer:817776337234165790>',
      'Widowmaker': '<:widowmaker:735555840169345136>',
      'Illari': '<:illari:1141824878979321906>',
      'Lúcio': '<:lucio:817777930531897346>',
      'Mercy': '<:mercy:735555360668254256>',
      'Wuyang': '<:wuyang:1405664483120250941>',
      'Zenyatta': '<:zenyatta:817778858652598272>',
      'Doomfist': '<:doomfist:735555778647293972>',
      'Junker Queen': '<:junkerqueen:1031737097809305621>',
      'Mauga': '<:mauga:1209910728270544926>',
      'Orisa': '<:orisa:735555395610738792>',
      'Ramattra': '<:ramattra:1055912552976105502>',
      'Reinhardt': '<:reinhardt:735555523684073612>',
      'Sigma': '<:sigma:991400349145501786>',
      'Winston': '<:winston:735555573646622842>',
      'Wrecking Ball': '<:wreckingball:735555646602084362>',
      'Ashe': '<:ashe:817774431731581018>',
      'Bastion': '<:bastionpio:991399746495328256>',
      'Cassidy': '<:cassidy:735555854371258531>',
      'Echo': '<:echo:817773566233280532>',
      'Freja': '<:freja:1369685053495574619>',
      'Genji': '<:genji:817773792901988352>',
      'Mei': '<:mei:845992873488678973>',
      'Pharah': '<:pharah:735555275137876010>',
      'Reaper': '<:reaper1:991398767704146021>',
      'Sojourn': '<:sojourn:1031737082340720782>',
      'Sombra': '<:sombra:735555409485496411>',
      'Symmetra': '<:symmetra:845993408023887895>',
      'Torbjörn': '<:torbjorn:735555545469026357>',
      'Ana': '<:ana:735555677279223819>',
      'Baptiste': '<:baptiste:845993713285333002>',
      'Brigitte': '<:brigitte:735555616780714096>',
      'Kiriko': '<:kiriko:1031736769961545828>',
      'Lifeweaver': '<:lifeweaver:1117145455390892134>',
      'Moira': '<:moira:735555820749717657>',
      'Juno': '<:juno:1267575692288327702>',
      'Venture': '<:venture:1235319765950664845>',
      'Hazard': '<:hazard:1322282245884739695>'
    };

    // Función para reemplazar héroe por héroe + emoji
    const formatHeroes = (text) => {
      if (!text) return "N/A";
      // Recorremos cada héroe definido en emojis y hacemos replace
      for (const hero in emojis) {
        const regex = new RegExp(`\\b${hero}\\b`, "g"); // \b asegura coincidencia exacta
        text = text.replace(regex, `${hero} ${emojis[hero]}`);
      }
      return text;
    };

    try {
      await interaction.deferReply(); // Esto asegura que Discord sabe que está en progreso
      // Embed
      const embed = {
        color: 0xfb923c,
        title: `Información de la tienda de Overwatch 2 <:overwatch:735558639603155027>`,
        fields: [
          {
            name: "<:decision:973254562154709112> Destacado", //Sugerencia
            value: formatHeroes(result.items), // Reemplazamos héroes por héroe+emoji
          },
          {
            name: "<:afirmativo:991399660990255125> Paquete de temporada",
            value: result.season,
            // value: formatHeroes(result.season),
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

      await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
    }
    catch (err) {
      await interaction.reply({ content: 'Se ha producido un error. Inténtalo de nuevo en unos minutos.', ephemeral: true });
    }
  },
};
