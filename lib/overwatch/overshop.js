const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { Shop } = require('../model');
const get = require('../https/get');

// Config
const { overwatch, language } = require("../../config.json");


// Get Shop Data
const GetShopData = async (lang) => {
    const options = {
        hostname: 'eu.shop.battle.net',
        path: `/api/itemshop/overwatch/pages/6a011f23-5874-4df5-a38f-1086f6c636f6?userId=0&locale=${lang}`,
        //Es posible que los headers no sean necesarios
        headers: {
            'Accept-Language': lang
        }
    }

    const json = await get(options);

    if (json.startsWith('{')) {
        return JSON.parse(json);
    }
    else {
        return null;
    }
}

// Get Card Data
const GetCardData = async (lang) => {
    const options = {
        hostname: 'eu.shop.battle.net',
        path: `/api/browsing/family/overwatch?locale=es-es`,
        //Es posible que los headers no sean necesarios
        headers: {
            'Accept-Language': lang
        }
    }

    const json = await get(options);
    //console.log('json GetCardData', json)
    //console.log(lang)

    if (json.startsWith('{')) {
        const shopData = JSON.parse(json);
        //console.log('shopData', shopData)

        if (!shopData.browsingCardGroups) return null;
        
        let cards = '';

        for (const i of shopData.browsingCardGroups) {
            if (i.type === 'CARD_COLLECTION') {
                for (const j of i.cardIds) {
                    cards += `${j ? `id=${j}&` : ""}`;
                }
            }
        }

        return `${cards}locale=${lang}`;
    }
    else {
        return null;
    }
}

// Get Collection Data
const GetCollectionsData = async (lang) => {
    const params = `?${await GetCardData(lang)}`;
    const options = {
        hostname: `eu.shop.battle.net`,
        path: `/api/card-collection${params}`,
        headers: {
            'accept-language': lang,
            'content-type': 'application/json',
            'x-xsrf-token': 'fd76b0eb-1578-4eb5-951e-a344213771e0', //511f7c4d-c644-4f9f-abaf-e23c33e9db63
            //'content-length': params.length,
            'cookie': 'XSRF-TOKEN=fd76b0eb-1578-4eb5-951e-a344213771e0;',
        }
    }
    //console.log(`${lang.slice(lang.length - 2)}`) //us
    //console.log(lang) //en-us

    const json = await get(options);
    //console.log('json GetCollectionsData', json)
    if (json.startsWith('[{')) {
        return JSON.parse(json);
    }
    else {
        return null;
    }
}

const OverShop = async () => { 
  const result = await GetShopData(language);
  //console.log('result', result)
  const card = await GetCollectionsData(language);
  //console.log('card', card)
  //console.log(language) //en-us
  let seasonCard = "";
  let itemsData = "";

  if (!result) return;

  for (const i of result.mtxCollections[0].items) {
    itemsData += `* ${i.title.replace("Overwatch® 2: ", "")} - **${Math.floor(i.price.raw)} ${i.price.currency !== "EUR" ? '\<:moneda:1044000893726625823>' : ''}${i.price.currency == 'EUR' ? 'EUR' : ''}**\n`;
    //console.log(itemsData)
  }

  for (const i of card) {
    if (i.slug.match(/(battle-pass)|(starter-pack)|(tier-skip)|(hero)|(ultimate)/g)) {
      seasonCard += `* ${i.title.replace("Overwatch® 2: ", "")} - **${i.price.raw} ${i.price.currency !== "EUR" ? '\<:moneda:1044000893726625823>' : ''}${i.price.currency == 'EUR' ? 'EUR' : ''}**\n`
      //console.log(seasonCard)
    }
  }

  return {
    id: result.id,
    items: itemsData,
    season: seasonCard,
  }
}

const OverShopCron = async (client) => {
  const channel = client.channels.cache.get(overwatch.shopchannel);
  const result = await OverShop();

  if (!result) return;

  // Embed
  const embed = {
    author: {
      name: 'Overwatch 2',
      icon_url: 'https://images-ext-1.discordapp.net/external/tTKzALJXJSHXWduLkHt9hT_d_obdeFHQ_cyx5-EpIQ8/https/cdn.patchbot.io/games/106/overwatch_2_sm.webp?format=webp&width=312&height=312',
      url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
    },
    color: 0xfb923c,
    title: `Información de la tienda de Overwatch 2`,
    fields: [
      {
        name: "Destacado", //Sugerencia
        value: result.items,
      },
      {
        name: "Paquete de temporada",
        value: result.season,
      }
    ],
    timestamp: new Date().toISOString()
  };

  // Enlaces
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Ir a la tienda de Overwatch 2')
      .setStyle('Link')
      .setURL('https://eu.shop.battle.net/es-es/family/overwatch'),
    );

  // Obtener ID de tienda de DB
  const shopData = await Shop.findOne({ where: { id: 1 }});

  // Cuando no está en la base de datos
  if (!shopData) {
    const lastMessageId = await channel.send({ embeds: [embed], components: [row] });

    await Shop.create({
      shop_id: result.id,
      shop_items: result.items.length,
      message_id: lastMessageId.id,
    });
  }
  // En la base de datos
  else {
    // Si el ID del resultado es diferente.
    if (shopData.shop_id !== result.id) {
      const lastMessage = await channel.send({ embeds: [embed], components: [row] });

      const db = await Shop.update(
        {
          shop_id: result.id,
          shop_items: result.items.length,
          message_id: lastMessage.id
        }, { where: { shop_id: shopData.shop_id }}
      );
      db;
    }

    // o la longitud de los objetos es diferente.
    else if (shopData.shop_items !== result.items.length) {
      let editMessage = shopData.message_id
        ? await channel.messages
            .fetch(shopData.message_id)
            .then((msg) => msg.edit({ embeds: [embed], components: [row] }))
            .catch(() => console.log('error')) //Error en el comando /tienda
        : console.log("¡Error de edición!");

      const db = await Shop.update(
        {
          shop_id: result.id,
          shop_items: result.items.length,
          message_id: editMessage.id
        }, { where: { shop_id: shopData.shop_id }}
      );
      db;
    }
  }

  return;
}

module.exports = { GetShopData, GetCollectionsData, OverShop, OverShopCron };