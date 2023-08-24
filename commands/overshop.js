const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { OverShop } = require('../lib/overshop.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('상점')
    .setDescription('오버워치 2의 상점을 보여줍니다'),
  async execute(interaction) {
    const result = await OverShop();

    if (!result) return await interaction.reply({ content: "데이터를 불러오는 중에 오류가 발생했습니다.", ephemeral: true });

    try {
      // Embed
      const embed = {
        color: 0xfb923c,
        title: `오버워치 2 상점 정보`,
        fields: [
          {
            name: "추천",
            value: result.items,
          },
          {
            name: "시즌 팩",
            value: result.season,
          }
        ]
      };

      // Links
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('오버워치 2 상점으로 이동')
          .setStyle('Link')
          .setURL('https://kr.shop.battle.net/ko-kr/family/overwatch'),
        );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
    catch (err) {
      await interaction.reply({ content: '오류가 발생했습니다. 잠시후 다시 시도해주세요', ephemeral: true });
    }
  },
};