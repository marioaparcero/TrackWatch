const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { Patch } = require('../model');
const get = require('../https/get');

// Config
const { overwatch, language } = require("../../config.json");

// Get HTML Body Data
const GetPatchData = async (lang) => {
    const options = {
        hostname: 'overwatch.blizzard.com',
        path: `/${lang}/news/patch-body/live/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/`,
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    }

    return await get(options);
}

const OverPatchCron = async (client) => {
  const channel = client.channels.cache.get(overwatch.patchchannel);
  const patchhtml = await GetPatchData(language); //language //es-es
  //console.log('patchhtml', patchhtml)

  const conv = patchhtml.match(/(?<=id=\")([^"]*)(?=\")/g)[0];
  //console.log('conv:', conv) //patch-2024-02-13
  
  // Extraer la fecha
  const datePatchMatch = patchhtml.match(/(?<=PatchNotes-date">)([^<]*)/g)[0];
  const datePatch = datePatchMatch ?? "Fecha no encontrada"; // ? datePatchMatch[0] : "Fecha no encontrada"; // ? datePatchMatch[1].trim() : "Fecha no encontrada";
  
  // Extraer el título
  const titlePatchMatch = patchhtml.match(/(?<=PatchNotes-sectionTitle">)([^<]*)/g);
  const titlePatch = titlePatchMatch ?? "Título no encontrado"; // ? titlePatchMatch[0] : "Título no encontrado";  
  
  // Extraer la descripción
  //const descriptionPatchMatch = patchhtml.match(/(?<=PatchNotes-sectionDescription">)([^<]*)/); //No funciona
  //const descriptionPatchMatch = patchhtml.match(/<div class="PatchNotes-sectionDescription"><p>(.*?)<\/p>/sg); //No funciona
  const descriptionPatchMatch = patchhtml.match(/(?<=<div class="PatchNotes-sectionDescription"><p>)(.*?)(?=<\/p>)/sg); //Solo /g creo que ya funciona
  //const descriptionPatch = descriptionPatchMatch ? descriptionPatchMatch[0] : "Descripción no encontrada"; // ? descriptionPatchMatch[0] : "Descripción no encontrada"; // ? descriptionPatchMatch[1].trim() : "Descripción no encontrada";
  const descriptionPatch = descriptionPatchMatch ?? "Descripción no encontrada";
  
  //console.log('Titulo:', titlePatch) //TE DAMOS LA BIENVENIDA A LA TEMPORADA 9: CAMPEONES
  //console.log('Fecha:', datePatch) //13 de febrero de 2024
  //console.log('descripción:', descriptionPatch) //¡Se ha subido nueva información del parche! Para obtener información más detallada sobre el parche, consulte el enlace
  let date = '';

  // Si la fecha, titulo, descripcion es nula, no se realiza ninguna acción.
  if (!conv) return;
  if (!datePatch) return;
  if (!titlePatch) return;
  if (!descriptionPatch) return;

  // Convertir string de fecha del parche
  date = conv.replace('patch-', '');
  patchtime = new Date(date);
  patchurl = `https://overwatch.blizzard.com/es-es/news/patch-notes/live/${date.split('-')[0]}/${date.split('-')[1]}/#patch-${date}`;

  const MAX_DESCRIPTION_LENGTH = 2048; // Máximo de caracteres admitidos en la descripción de un embed de Discord

  let descriptionEmbed = `**${titlePatch[0]}**\n${descriptionPatch[0]}\n**${titlePatch[1]}**\n${descriptionPatch[1]}`;

  // Verificar si la longitud de la descripción excede el límite máximo
  if (descriptionEmbed.length > MAX_DESCRIPTION_LENGTH) {
    // Truncar la descripción si es demasiado larga
    descriptionEmbed = descriptionEmbed.slice(0, MAX_DESCRIPTION_LENGTH - 3) + '...';
  }
  // Embed
  const embed = {
    author: {
        name: 'Overwatch 2',
        icon_url: 'https://images-ext-1.discordapp.net/external/tTKzALJXJSHXWduLkHt9hT_d_obdeFHQ_cyx5-EpIQ8/https/cdn.patchbot.io/games/106/overwatch_2_sm.webp?format=webp&width=312&height=312',
        url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
    },
    //color: 0xfb923c, // Naranja
    //color: 0x60a5fa, // Azul
    //color: 0x00ff00, // Verde
    //color: 0xff0000, // Rojo
    color: 0xffffff, // Blanco
    url: patchurl,
    //title: `Información del parche de Overwatch 2 - ${patchtime.getDate()}/${patchtime.getMonth() + 1}/${patchtime.getFullYear()}`,
    title: `${datePatch}`,
    //description: '¡Se ha subido nueva información del parche! Para obtener información más detallada sobre el parche, consulte el enlace',
    description: descriptionEmbed,
    thumbnail: {
        url: 'https://images-ext-1.discordapp.net/external/tTKzALJXJSHXWduLkHt9hT_d_obdeFHQ_cyx5-EpIQ8/https/cdn.patchbot.io/games/106/overwatch_2_sm.webp?format=webp&width=312&height=312'
    },
    //timestamp: new Date().toISOString()
  };

  // Enlaces
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Ir a las notas del parche de Overwatch 2')
      .setStyle('Link')
      .setURL(patchurl),
    );
    
    // Obtener el ID de la tienda desde la base de datos
    const patchData = await Patch.findOne({ where: { patch_date: date }});
  
    // Cuando no está en la base de datos
    if (!patchData) {
        const db = await Patch.create({ patch_date: date });
        db;
        await channel.send({ embeds: [embed], components: [row] });
    }
    // Cuando está en la base de datos
    else {
        if (patchtime > new Date(patchData.patch_date)) {
            const db = await Patch.update({ patch_date: date }, { where: { patch_date: patchData.patch_date }});
            db;
            await channel.send({ embeds: [embed], components: [row] });
        }
    }
  
    return;
}

module.exports = { GetPatchData, OverPatchCron };