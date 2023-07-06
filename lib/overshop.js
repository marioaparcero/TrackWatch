const fetch = require('node-fetch');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { OverShopDB } = require('../db/overshop.js');

// Config
const { shopchannel } = require("../config.json");

// Get HTML Body Data
const GetData = async (lang) => {
  try {
    const res = await fetch(`https://kr.shop.battle.net/api/itemshop/overwatch/pages/6a011f23-5874-4df5-a38f-1086f6c636f6?userId=0&locale=${lang}`, {
      headers: {
        "Accept-Language": lang
      }
    });
    const body = await res.text();

    return body.length ? body : null;
  } catch (error) {
    return console.error(error);
  }
};

const GetCardData = async (lang) => {
  try {
    const shop = await fetch("https://kr.shop.battle.net/api/browsing/family/overwatch", {
      "headers": {
        "accept-language": lang,
      },
      "method": "GET"
    });
    const shopData = JSON.parse(await shop.text());
    const cards = [];
    
    for (const i of shopData.browsingCardGroups) {
      for (const j of i.cardIds) {
        cards.push(`"${j}"`);
      }
    }
    
    const cardData = await fetch("https://kr.shop.battle.net/api/card-collection", {
      "headers": {
        "accept-language": lang,
        "content-type": "application/json",
        "x-xsrf-token": "fd76b0eb-1578-4eb5-951e-a344213771e0",
        "cookie": "XSRF-TOKEN=fd76b0eb-1578-4eb5-951e-a344213771e0;",
      },
      "body": `[${cards}]`,
      "method": "POST"
    });

    const body = await cardData.text();

    return body.length ? body : null;
  } catch (error) {
    return console.error(error);
  }
};

const OverShop = async () => { 
  const result = JSON.parse(await GetData('ko-KR'));
  const card = JSON.parse(await GetCardData('ko-KR'));
  let seasonCard = "";
  let itemsData = "";

  if (!result) return;

  for (const i of result.mtxCollections[0].items) {
    itemsData += `${i.title} - ${i.price.currency !== "KRW" ? '\:coin:' : ''} ${Math.floor(i.price.raw)} ${i.price.currency == 'KRW' ? '원' : ''}\n`;
  }

  for (const i of card) {
    if (i.slug == "overwatch-battle-pass" || i.slug == "overwatch-starter-pack") {
      seasonCard += `${i.title} - ${i.price.currency !== "KRW" ? '\:coin:' : ''} ${i.price.raw} ${i.price.currency == 'KRW' ? '원' : ''}\n`
    }
  }

  return {
    id: result.id,
    items: itemsData,
    season: seasonCard,
  }
}

const OverShopCron = async (client) => {
  const channel = client.channels.cache.get(shopchannel);
  const result = await OverShop();

  if (!result) return;

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
    ],
    timestamp: new Date().toISOString()
  };

  // Links
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('오버워치 2 상점으로 이동')
      .setStyle('Link')
      .setURL('https://kr.shop.battle.net/ko-kr/family/overwatch'),
    );

  // Get shop ID from DB
  const shopData = await OverShopDB.findOne({
    where: {
      id: 1
    }
  });

  // not in DB
  if (!shopData) {
    const lastMessageId = await channel.send({ embeds: [embed], components: [row] });

    await OverShopDB.create({
      shop_id: result.id,
      shop_items: result.items.length,
      message_id: lastMessageId.id,
    });
  }
  // in DB
  else {
    // if Result ID is difference.
    if (shopData.shop_id !== result.id) {
      const lastMessage = await channel.send({ embeds: [embed], components: [row] });

      await OverShopDB.update({
        shop_id: result.id,
        shop_items: result.items.length,
        message_id: lastMessage.id,
      }, {
        where: {
          shop_id: shopData.shop_id,
        }
      });
    }

    // or Items length is different.
    else if (shopData.shop_items !== result.items.length) {
      let editMessage = shopData.message_id
        ? await channel.messages
            .fetch(shopData.message_id)
            .then((msg) => msg.edit({ embeds: [embed], components: [row] }))
            .catch(() => console.log('error'))
        : console.log("Edit Failed!");

      await OverShopDB.update({
        shop_id: result.id,
        shop_items: result.items.length,
        message_id: editMessage.id
      }, {
        where: {
          shop_id: shopData.shop_id,
        }
      });
    }
  }

  return;
}

module.exports = { OverShop, OverShopCron };