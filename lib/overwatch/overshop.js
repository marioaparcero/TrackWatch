const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { Shop } = require('../model');
const get = require('../https/get');
const { formatHeroes } = require("../../utils/emojis");

// Para Testing
// https://us.shop.battle.net/api/browsing/family/overwatch?platform=Web&locale=es-es
// https://us.shop.battle.net/api/itemshop/pages/blt2065e08d915d3ff8?userId=0&locale=es-ES&buttons=false
// https://us.shop.battle.net/api/itemshop/pages/blt01ee8af4f4da5e5f?userId=0&locale=es-ES&buttons=false
// https://us.shop.battle.net/api/card-collection?id=blt9f0779a1ce3674d7&id=blt0231c045135f4d1d&id=bltff44f3db7e349cb3&id=blt11708b9adcddb5e2&id=blt9463b6e951095627&locale=es-es
// https://us.shop.battle.net/api/card-collection?id=blt0826ddc54d51d3b5&id=blt9f0779a1ce3674d7&id=blt0231c045135f4d1d&id=bltff44f3db7e349cb3&id=blt11708b9adcddb5e2&id=blt9463b6e951095627&id=bltcfe154a190da0dc5&id=bltaed8c2dfebd418e2&id=blt6ba8925b6fb5d816&id=blt96e4f0ad614bec41&locale=es-es
// https://us.shop.battle.net/api/card-collection?id=blt0826ddc54d51d3b5&locale=es-es
// https://us.shop.battle.net/api/card-collection?id=bltaed8c2dfebd418e2&locale=es-es

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

  const exchangeRateGBPtoEUR = 1.13;

  // Función auxiliar para formatear el precio y la moneda
  function getFormattedPrice(item, isCard = false) {
    let rawPrice = item.price.raw;
    let currencyLabel = "";

    // 1. Regla especial: Pase de batalla a 0 -> 1000 monedas
    if (isCard && rawPrice === 0) {
      rawPrice = 1000;
    }

    // 2. Lógica de conversión y etiquetas
    if (item.price.currency === "GBP") {
      // Conversión GBP a EUR con terminación .99
      rawPrice = (Math.floor(rawPrice * exchangeRateGBPtoEUR) + 0.99).toFixed(2);
      currencyLabel = "EUR";
    } else if (item.price.currency === "USD") {
      currencyLabel = "EUR";
    } else if (item.price.currency === "EUR") {
      currencyLabel = "EUR";
    } else {
      // Si no es ninguna de las anteriores, asumimos que son monedas virtuales (XWC, etc.)
      currencyLabel = "<:moneda:1044000893726625823>";
    }

    return `**${rawPrice} ${currencyLabel}**`;
  }

  // Procesar itemsData
  for (const i of result.mtxCollections[0].items) {
    const cleanTitle = i.title.replace("Overwatch®: ", "");
    itemsData += `* ${cleanTitle} - ${getFormattedPrice(i)}\n`;
  }

  // Procesar seasonCard (Filtrado por slug)
  for (const i of card) {
    if (i.slug.match(/(battle-pass)|(starter-pack)|(tier-skip)|(hero)|(ultimate)/g)) {
      const cleanTitle = i.title.replace("Overwatch®: ", "");
      seasonCard += `* ${cleanTitle} - ${getFormattedPrice(i, true)}\n`;
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
  try {
    // 1. Verificar si el canal existe
    const channel = client.channels.cache.get(overwatch.shopchannel);
    if (!channel) return console.error("Canal de tienda no encontrado.");

    const result = await OverShop();
    if (!result) return;

    // Función para dividir el texto (límite 1024 caracteres de Discord)
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

    const formattedItems = formatHeroes(result.items);
    const itemChunks = splitText(formattedItems);

    // 2. Crear el Embed usando EmbedBuilder
    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Overwatch',
        iconURL: 'https://images-ext-1.discordapp.net/external/4FuuxocaKy80RYDS27BxMgI_2KnunfafT0XMziE4vLY/https/cdn.patchbot.io/games/106/overwatch-2_1770906990_sm.webp?format=webp&width=240&height=240',
        url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
      })
      .setColor(0xfb923c)
      .setTitle(`Información de la tienda de Overwatch <:overwatch:735558639603155027>`)
      .setTimestamp();

    // Añadimos items divididos en campos si es necesario
    itemChunks.forEach((chunk, index) => {
      embed.addFields({
        name: index === 0 ? "<:decision:973254562154709112> Destacado" : "<:decision:973254562154709112> Destacado (continuación)",
        value: chunk || "No hay artículos actualmente."
      });
    });

    // Añadimos sección de temporada con validación de longitud
    if (result.season) {
      const seasonValue = result.season.length > 1024
        ? result.season.substring(0, 1021) + "..."
        : result.season;

      embed.addFields({
        name: "<:afirmativo:991399660990255125> Paquete de temporada",
        value: seasonValue
      });
    }

    // 3. Botón de Enlace
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
  } catch (error) {
      console.error("Error en OverShopCron:", error);
  }
}

module.exports = { GetShopData, GetCollectionsData, OverShop, OverShopCron };
