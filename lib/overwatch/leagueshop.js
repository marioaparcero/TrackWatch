const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { LeagueShop } = require('../model');
const get = require('../https/get');

// Config
const { overwatch, language } = require("../../config.json");

//https://web.archive.org/web/20240116223140/https://www.overwatchleague.com/en-us/cosmetics
const GetCardData = async (lang) => {
    const options = {
        hostname: 'overwatchleague.com',
        path: `/${lang.toLowerCase()}/cosmetics`,
        headers: {
            'Accept-Language': lang
        }
    }
    
    const html = await get(options);
    const json = html.match(/(?<=<script id="__NEXT_DATA__" type="application\/json">)(.*?)(?=<\/script>)/g);
    //console.log(json)

    if (json.startsWith('{')) {
        return JSON.parse(json);
    }
    else {
        return null;
    }
}

const GetLeagueShop = async (lang) => { 
    const result = await GetCardData(lang);
    //console.log(result)
    let itemsData = "";
  
    if (!result) return;

    const updateAt = result.props.pageProps.blocks[1].mtxVideoBackgroundWrapper.updatedAt;
    const cards = result.props.pageProps.blocks[2].virtualCurrency.cards;
  
    for (const i of cards) {
      itemsData += `* ${i.title} ${i.team.name ? `- ${i.team.name}` : ''} :gem: ${i.price}\n`;
      //console.log(itemsData)
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
        title: `Información de la tienda de la Liga Overwatch`,
        fields: [
            {
                name: "Lista de productos",
                value: result.items,
            }
        ],
        timestamp: new Date().toISOString()
    };

    // Links
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Ir a la tienda de la Liga Overwatch')
            .setStyle('Link')
            .setURL('https://overwatchleague.com/en-us/cosmetics'),
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