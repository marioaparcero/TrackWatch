const https = require('node:https');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { LeagueShop } = require('../model');

// Config
const { overwatch, language } = require("../../config.json");

const GetCardData = async (lang) => {
    const options = {
        hostname: 'overwatchleague.com',
        path: `/${lang.toLowerCase()}/cosmetics`,
        headers: {
            'Accept-Language': lang
        }
    }

    return new Promise(resolve => {
        let data = [];

        https.get(options, res => {
            res.on('data', chunk => {
                data.push(chunk);
            });

            res.on('end', () => {
                const html = Buffer.concat(data).toString();
                const json = html.match(/(?<=<script id="__NEXT_DATA__" type="application\/json">)(.*?)(?=<\/script>)/g);
                resolve(JSON.parse(json));
            });
        });
    });
}

const GetLeagueShop = async (lang) => { 
    const result = await GetCardData(lang);
    let itemsData = "";
  
    if (!result) return;

    const updateAt = result.props.pageProps.blocks[1].mtxVideoBackgroundWrapper.updatedAt;
    const cards = result.props.pageProps.blocks[2].virtualCurrency.cards;
  
    for (const i of cards) {
      itemsData += `* ${i.title} ${i.team.name ? `- ${i.team.name}` : ''} :gem: ${i.price}\n`;
    }
  
    return {
      id: updateAt,
      items: itemsData,
    }
}
  
const LeagueShopCron = async (client) => {
    const channel = client.channels.cache.get(overwatch.shopchannel);
    const result = await GetLeagueShop(language);

    if (!result) return;

    // Embed
    const embed = {
        color: 0x60a5fa,
        title: `오버워치 리그 상점 정보`,
        fields: [
            {
                name: "상품 목록",
                value: result.items,
            }
        ],
        timestamp: new Date().toISOString()
    };

    // Links
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('오버워치 리그 상점으로 이동')
            .setStyle('Link')
            .setURL('https://overwatchleague.com/ko-kr/cosmetics'),
    );

    // Get shop ID from DB
    const shopData = await LeagueShop.findOne({ where: { id: 1 } });

    // not in DB
    if (!shopData) {
        const lastMsgId = await channel.send({ embeds: [embed], components: [row] });

        const db = await LeagueShop.create({
            shop_date: result.id,
            shop_items: result.items.length,
            message_id: lastMsgId.id
        });
        db;
    }
    // in DB
    else {
        // if Result ID is difference.
        if (shopData.shop_id !== result.id) {
            const lastMessage = await channel.send({ embeds: [embed], components: [row] });

            const db = await LeagueShop.update(
                {
                    shop_date: result.id,
                    shop_items: result.items.length,
                    message_id: lastMessage.id
                }, { where: { shop_id: shopData.shop_id }}
            );
            db;
        }
    }

    return;
}

module.exports = { LeagueShop, LeagueShopCron };