const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { LeagueShop } = require('../lib/leagueshop.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('리그상점')
    .setDescription('오버워치 리그의 상점을 보여줍니다'),
  async execute(interaction) {
    const result = await LeagueShop('ko-KR');

    if (!result) return await interaction.reply({ content: "데이터를 불러오는 중에 오류가 발생했습니다.", ephemeral: true });

    try {
      // Embed
      const embed = {
        color: 0x60a5fa,
        title: `오버워치 리그 상점 정보`,
        fields: [
          {
            name: "상품 목록",
            value: result.items,
          }
        ]
      };

      // Links
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('오버워치 리그 상점으로 이동')
          .setStyle('Link')
          .setURL('https://overwatchleague.com/ko-kr/cosmetics'),
        );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
    catch (err) {
      await interaction.reply({ content: '오류가 발생했습니다. 잠시후 다시 시도해주세요', ephemeral: true });
    }
  },
};