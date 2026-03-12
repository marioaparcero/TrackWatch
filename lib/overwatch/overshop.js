const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { Shop } = require('../model');
const get = require('../https/get');
const { formatHeroes } = require("../../utils/emojis");

// Config
const { overwatch, language } = require("../../config.json");

// Get Shop Data
const GetShopData = async (lang) => {
    // console.log(lang)
    const options = {
        hostname: 'eu.shop.battle.net',
        path: `/api/itemshop/pages/blt01ee8af4f4da5e5f?userId=0&locale=${lang}`, // &currency=EUR
        // path: `/api/itemshop/overwatch/pages/6a011f23-5874-4df5-a38f-1086f6c636f6?userId=0&locale=${lang}`,
        // Es posible que los headers no sean necesarios
        headers: {
            'Accept-Language': lang, // 'es-ES,es;'
            // 'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3' // Chrome/120.0.0.0
            // 'Cookie': 'XSRF-TOKEN=67ad84c2-c704-4f45-9bff-120acf4b8178' // ¡Activar si falla!
            // 'content-type': 'application/json',
            // 'x-xsrf-token': '67ad84c2-c704-4f45-9bff-120acf4b8178' // 'fd76b0eb-1578-4eb5-951e-a344213771e0', //511f7c4d-c644-4f9f-abaf-e23c33e9db63

            // 'cookie': 'XSRF-TOKEN=34c1fe83-ee20-4eed-b5a3-165a2f269fd3;', // 'XSRF-TOKEN=fd76b0eb-1578-4eb5-951e-a344213771e0;',
            // // 'cookie': 'loc=es-es; access_token=OWUzNThlYWItMzVjYS00N2YyLWI1OTktNTc1MDVmNTY3ODZj; XSRF-TOKEN=34c1fe83-ee20-4eed-b5a3-165a2f269fd3',
        }

        // Para pruebas
        // curl -i -X GET "https://eu.shop.battle.net/api/itemshop/overwatch/pages/6a011f23-5874-4df5-a38f-1086f6c636f6?userId=0&locale=es-es" -H "Accept-Language: es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7"
        // curl -i -X GET "https://eu.shop.battle.net/api/itemshop/overwatch/pages/6a011f23-5874-4df5-a38f-1086f6c636f6?userId=0&locale=es-es" -H "Accept-Language: es-es"
        // curl -i -X GET "https://eu.shop.battle.net/api/itemshop/pages/blt01ee8af4f4da5e5f?userId=0&locale=es-ES" -H "Accept: application/json" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    }

    const json = await get(options);
    // console.log('✅Respuesta:', json)

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
        path: `/api/browsing/family/overwatch?platform=Web&locale=es-es`, // &currency=EUR
        // Es posible que los headers no sean necesarios
        headers: {
            'Accept-Language': lang,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            // 'Cookie': 'XSRF-TOKEN=67ad84c2-c704-4f45-9bff-120acf4b8178'

            // 'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            // 'accept-language': "es",
            // 'cache-control': "max-age=0",
            // 'priority': "u=0, i",
            // 'sec-ch-ua': "\"Not:A-Brand\";v=\"99\", \"Google Chrome\";v=\"145\", \"Chromium\";v=\"145\"",
            // 'sec-ch-ua-mobile': "?0",
            // 'sec-ch-ua-platform': "\"Windows\"",
            // 'sec-fetch-dest': "document",
            // 'sec-fetch-mode': "navigate",
            // 'sec-fetch-site': "none",
            // 'sec-fetch-user': "?1",
            // 'upgrade-insecure-requests': "1",
            // 'cookie': "XSRF-TOKEN=dc6d994d-4b51-4edc-b867-4f00fcf62fe1; autoLoginChecked=1; access_token=NjA1OWUzZTctYTU3ZS00YmRhLWEyMmUtNmZlZWJkNjg1OTk5; deviceTrackingId=d275d616-d067-4fdd-a6ff-5cf910d401b3; sessionTrackingId=ac234ee2-21d0-457e-93b8-0aad6f80f2b0; loc=es-es"
        }
    }

    const json = await get(options);
    // console.log('json GetCardData', json)
    // console.log(lang)

    if (json.startsWith('{')) {
        const shopData = JSON.parse(json);
        // console.log('shopData', shopData)

        if (!shopData.browsingCardGroups) return null;
        
        let cards = '';

        for (const i of shopData.browsingCardGroups) {
            if (i.type === 'CARD_COLLECTION') {
                for (const j of i.cardIds) {
                    cards += `${j ? `id=${j}&` : ""}`;
                    // console.log('cards', cards)
                }
            }
        }

        return `${cards}locale=${lang}`;
    }
    else {
        return null;
    }

  // Otra forma de hacerlo (Solo para testing)
  // if (json.startsWith('{')) {
  //   const shopData = JSON.parse(json);

  //   if (!shopData.browsingCardGroups) return null;

  //   // Usamos URLSearchParams para manejar los IDs de forma limpia
  //   const params = new URLSearchParams();

  //   for (const group of shopData.browsingCardGroups) {
  //     if (group.type === 'CARD_COLLECTION' && group.cardIds) {
  //       for (const id of group.cardIds) {
  //         if (id) params.append('id', id);
  //       }
  //     }
  //   }

  //   // Añadimos el locale al final
  //   params.set('locale', lang);

  //   const finalQuery = params.toString();
  //   console.log('Resultado final:', finalQuery);

  //   return finalQuery;
  // }

}

// Get Collection Data
const GetCollectionsData = async (lang) => {
    const params = `?${await GetCardData(lang)}`;
    // console.log('params', params)
    const options = {
        // protocol: 'https:',
        hostname: `us.shop.battle.net`, // hostname: `${lang.slice(lang.length - 2)}.shop.battle.net`,
        path: `/api/card-collection${params}`,
        // path: '/api/card-collection?id=bltaed8c2dfebd418e2&locale=es-es',
        // port: 443,
        // method: 'POST',
        headers: {
            'accept-language': lang,
            'content-type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3', // Si hay User-Agent no hace falta la cookie y x-xsrf-token
            'Cookie': 'XSRF-TOKEN=67ad84c2-c704-4f45-9bff-120acf4b8178',
            'x-xsrf-token': '67ad84c2-c704-4f45-9bff-120acf4b8178' //'34c1fe83-ee20-4eed-b5a3-165a2f269fd3', //'fd76b0eb-1578-4eb5-951e-a344213771e0', //511f7c4d-c644-4f9f-abaf-e23c33e9db63
            // 'content-length': params.length,
            // 'cookie': 'loc=es-es; access_token=OWUzNThlYWItMzVjYS00N2YyLWI1OTktNTc1MDVmNTY3ODZj; XSRF-TOKEN=34c1fe83-ee20-4eed-b5a3-165a2f269fd3',
        }
    }
    // console.log(`${lang.slice(lang.length - 2)}`) // us, es
    // console.log(lang) // en-us, es-es

    const json = await get(options);
    // console.log('⭐json GetCollectionsData', json)
    if (json.startsWith('[{')) {
        return JSON.parse(json);
    }
    else {
        return null;
    }
}

const OverShop = async () => { 
  const result = await GetShopData(language);
  // console.log('✅result', result)
  const card = await GetCollectionsData(language);
  // console.log('card', card)
  // console.log(language) // en-us
  let seasonCard = "";
  let itemsData = "";

  if (!result) return;

  // for (const i of result.mtxCollections[0].items) {
  //   itemsData += `* ${i.title.replace("Overwatch® 2: ", "")} - **${i.price.raw} ${i.price.currency !== "GBP" ? '\<:moneda:1044000893726625823>' : ''}${i.price.currency == 'GBP' ? 'EUR' : ''}**\n`; // ${Math.floor(i.price.raw)}
  //   // console.log(itemsData)
  // }

  // Tasa de cambio ajustada de GBP a EUR
  const exchangeRateGBPtoEUR = 1.13; // Ajustada para obtener los precios correctos

  // Función para convertir precios de GBP a EUR y ajustarlos para que terminen en .99
  function convertirGBPtoEUR(precioGBP) {
    let precioEUR = precioGBP * exchangeRateGBPtoEUR;
    
    // Redondeamos al valor más cercano y ajustamos a .99
    precioEUR = Math.floor(precioEUR) + 0.99;

    return precioEUR.toFixed(2); // Aseguramos que tenga dos decimales
  }

  // Procesar los elementos en result.mtxCollections[0].items
  for (const i of result.mtxCollections[0].items) {
    // Verificar si el precio es en GBP
    if (i.price.currency === "GBP") {
      // Convertir el precio a EUR
      const precioEUR = convertirGBPtoEUR(i.price.raw);
      // itemsData += `* ${i.title.replace("Overwatch® 2: ", "")} - **${precioEUR} EUR**\n`;
      itemsData += `* ${i.title.replace("Overwatch® 2: ", "")} - **${precioEUR} ${i.price.currency !== "GBP" ? '\<:moneda:1044000893726625823>' : 'EUR'}**\n`;
      // itemsData += `* ${i.title.replace("Overwatch® 2: ", "")} - **${precioEUR} ${i.price.currency !== "GBP" ? '\<:moneda:1044000893726625823>' : ''}${i.price.currency == 'GBP' ? 'EUR' : ''}**\n`;
    } else {
      // Si el precio ya está en EUR, mostrarlo directamente
      // itemsData += `* ${i.title.replace("Overwatch® 2: ", "")} - **${i.price.raw} EUR**\n`;
      itemsData += `* ${i.title.replace("Overwatch® 2: ", "")} - **${i.price.raw} ${i.price.currency !== "GBP" ? '\<:moneda:1044000893726625823>' : 'EUR'}**\n`;
      // itemsData += `* ${i.title.replace("Overwatch® 2: ", "")} - **${i.price.raw} ${i.price.currency !== "GBP" ? '\<:moneda:1044000893726625823>' : ''}${i.price.currency == 'GBP' ? 'EUR' : ''}**\n`;
    }
  }

  for (const i of card) {
    if (i.slug.match(/(battle-pass)|(starter-pack)|(tier-skip)|(hero)|(ultimate)/g)) {
      seasonCard += `* ${i.title.replace("Overwatch® 2: ", "")} - **${i.price.raw} ${i.price.currency !== "USD" ? '\<:moneda:1044000893726625823>' : ''}${i.price.currency == 'USD' ? 'EUR' : ''}**\n`;
      // console.log(seasonCard)
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
      name: 'Overwatch',
      icon_url: 'https://images-ext-1.discordapp.net/external/tTKzALJXJSHXWduLkHt9hT_d_obdeFHQ_cyx5-EpIQ8/https/cdn.patchbot.io/games/106/overwatch_2_sm.webp?format=webp&width=312&height=312',
      url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
    },
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
    ],
    timestamp: new Date().toISOString()
  };

  // Enlaces
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Ir a la tienda de Overwatch')
      .setStyle('Link')
      .setURL('https://shop.battle.net/family/overwatch'),
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

    // o si la longitud de los objetos es diferente.
    else if (shopData.shop_items !== result.items.length) {
      let editMessage = shopData.message_id
        ? await channel.messages
            .fetch(shopData.message_id)
            .then((msg) => msg.edit({ embeds: [embed], components: [row] }))
            .catch(() => console.log('error')) // Error en el comando /tienda
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
