const https = require('node:https');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { OverShopDB } = require('../db/overshop.js');

// Config
const { shopchannel } = require("../config.json");


// Get Shop Data
const GetShopData = async (lang) => {
  const options = {
      hostname: 'kr.shop.battle.net',
      path: `/api/itemshop/overwatch/pages/6a011f23-5874-4df5-a38f-1086f6c636f6?userId=0&locale=${lang}`,
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
              const json = JSON.parse(Buffer.concat(data).toString());
              resolve(json);
          });
      });
  });
}

// Get Card Data
const GetCardData = async (lang) => {
  const options = {
      hostname: 'kr.shop.battle.net',
      path: `/api/browsing/family/overwatch`,
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
              const shopData = JSON.parse(Buffer.concat(data).toString());
              let cards = '';

              for (const i of shopData.browsingCardGroups) {
                for (const j of i.cardIds) {
                  cards += `"${j}",`;
                }
              }

              resolve(cards.slice(0, -1));
          });
      });
  });
}

// Get Collection Data
const GetCollectionsData = async (lang) => {
  const postData = `[${await GetCardData(lang)}]`;
  const options = {
      protocol: 'https:',
      hostname: 'kr.shop.battle.net',
      path: '/api/card-collection',
      port: 443,
      method: 'POST',
      headers: {
        'accept-language': lang,
        'content-type': 'application/json',
        'content-length': postData.length,
        'x-xsrf-token': 'fd76b0eb-1578-4eb5-951e-a344213771e0',
        'cookie': 'XSRF-TOKEN=fd76b0eb-1578-4eb5-951e-a344213771e0;',
      }
  }

  return new Promise(resolve => {
      let data = [];

      const req = https.request(options, res => {
          res.on('data', chunk => {
              data.push(chunk);
          });

          res.on('end', () => {
              const json = JSON.parse(Buffer.concat(data).toString());
              resolve(json);
          });
      });

      req.write(postData);
      req.end();
  });
}

const OverShop = async () => { 
  const result = await GetShopData('ko-KR');
  const card = await GetCollectionsData('ko-KR');
  let seasonCard = "";
  let itemsData = "";

  if (!result) return;

  for (const i of result.mtxCollections[0].items) {
    itemsData += `* ${i.title} - ${i.price.currency !== "KRW" ? '\:coin:' : ''} ${Math.floor(i.price.raw)} ${i.price.currency == 'KRW' ? '원' : ''}\n`;
  }

  for (const i of card) {
    if (i.slug.match(/(battle-pass)|(starter-pack)|(tier-skip)|(hero)|(ultimate)/g)) {
      seasonCard += `* ${i.title} - ${i.price.currency !== "KRW" ? '\:coin:' : ''} ${i.price.raw} ${i.price.currency == 'KRW' ? '원' : ''}\n`
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

module.exports = { GetShopData, GetCollectionsData, OverShop, OverShopCron };