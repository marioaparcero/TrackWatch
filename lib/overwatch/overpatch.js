const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { Patch } = require('../model');
const get = require('../https/get');
const cheerio = require('cheerio');
const { getEmoji } = require("../../utils/emojis");

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

const GetPatchDataNow = async (lang) => {
    const options = {
        hostname: 'overwatch.blizzard.com',
        path: `/${lang}/news/patch-body/live/${new Date().getFullYear()}/${(new Date().getMonth()).toString().padStart(2, "0")}/`,
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    }
    return await get(options);
}

const OverPatchCron = async (client) => {
try {
  const channel = client.channels.cache.get(overwatch.patchchannel);
  const patchhtmlNext = await GetPatchData(language); // language // 'es-es'
  const match = patchhtmlNext.match("No se han encontrado notas del parche");
  let patchhtml = '';
  if (!match) {
    patchhtml = patchhtmlNext;
    // console.log('patchhtml', patchhtml)
  } else { 
    const patchhtmlNow = await GetPatchDataNow(language); // language // 'es-es'
    patchhtml = patchhtmlNow;
    // console.log('patchhtml', patchhtml)
  }
  // Versión del parche sin controlar (Antes)
  // const conv = patchhtml.match(/(?<=id=\")([^"]*)(?=\")/g)[0];
  // console.log('conv:', conv) 
  
  const matches = patchhtml.match(/(?<=id=\")([^"]*)(?=\")/g);
 
  // Versión del parche controlada
  if (!matches || matches.length === 0) {
    console.error("❌ No se encontró ningún atributo id con el formato patch-YYYY-MM-DD.");
    // return; // o conv = null; según lo que quieras hacer
  }

  const conv = matches[0];

  // // Versión del parche más controlada
  // let conv;

  // if (!matches || matches.length === 0) {
  //   const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  //   conv = `patch-${today}`;
  //   console.warn(`⚠️ No se encontró ningún id, se usa valor por defecto: ${conv}`);
  // } else {
  //   conv = matches[0];
  // }

  // console.log('conv:', conv); // patch-2025-06-27
  
  // Extraer la funcion
  const heroePatchMatch = patchhtml.match(/(?<=PatchNotesHeroUpdate-name">)([^<]*)/g);
  const heroePatch = heroePatchMatch ?? "Héroe"; // ? funcionPatchMatch[0] : "Función no encontrada"; // ? funcionPatchMatch[1].trim() : "Función no encontrada";

  // Extraer la habilidad
  const abilityPatchMatch = patchhtml.match(/(?<=PatchNotesAbilityUpdate-name">)([^<]*)/g);
  const abilityPatch = abilityPatchMatch ?? "Habilidad"; // ? abilityPatchMatch[0] : "Habilidad no encontrada"; // ? abilityPatchMatch[1].trim() : "Habilidad no encontrada";

  // Extraer la descripción de la habilidad
  // const descriptionAbilityPatchMatch = patchhtml.match(/(?<=PatchNotesAbilityUpdate-detailList">)([^<]*)/g); // Las cuenta pero no entra dentro
  // const descriptionAbilityPatchMatch = patchhtml.match(/(?<=PatchNotesAbilityUpdate-detailList">)([\s\S]*?)(?=<\/div>)/); // html
  // const descriptionAbilityPatchMatch = patchhtml.match(/(?<=PatchNotesAbilityUpdate-detailList">)([^<]*)/); // html
  
  // Los siguientes nodos funcionan:
  const descriptionAbilityPatchMatch = patchhtml.match(/(?<=<div class="PatchNotesAbilityUpdate-detailList"><ul>)(.*?)(?=<\/ul>)/sg); // Los li separado funcionan + /n
  // const descriptionListAbilityPatchMatch = descriptionAbilityPatchMatch.match(/<li>(.*?)<\/li>/gs); //(No funciona) para separar por li pero con .match no puedo hacer .match directamente, tengo que aplanarlo con .flat
  // const descriptionListAbilityPatchMatch = descriptionAbilityPatchMatch?.map(item => item.match(/<li>(.*?)<\/li>/sg)).flat()?.map(li => li.trim()); // Queda separados por <li>
  const descriptionListAbilityPatchMatch = descriptionAbilityPatchMatch?.map(item => item.match(/<li>(.*?)<\/li>/sg)?.map(li => li.replace(/<\/?li>/g, '').trim())).flat(); // Ya queda bien separado
  // console.log('descriptionListAbilityPatchMatch:', descriptionListAbilityPatchMatch)

  const descriptionAbilityPatch = descriptionListAbilityPatchMatch ?? "Descripción"; // ? descriptionAbilityPatchMatch[0] : "Descripción no encontrada"; // ? descriptionAbilityPatchMatch[1].trim() : "Descripción no encontrada";

  // Extraer icono de la habilidad
  // const iconAbilityPatchMatch = patchhtml.match(/(?<=<div class="PatchNotesAbilityUpdate-icon-container"><img>)(.*?)(?=<\/img>)/sg);
  // const iconAbilityPatchMatch = patchhtml.match(/(?<=PatchNotesAbilityUpdate-icon">)([^<]*)/g);
  // const iconAbilityPatch = iconAbilityPatchMatch ?? "Icono"; // ? iconAbilityPatchMatch[0] : "Icono no encontrado"; // ? iconAbilityPatchMatch[1].trim() : "Icono no encontrado";

  // Extraer la fecha
  const datePatchMatch = patchhtml.match(/(?<=PatchNotes-date">)([^<]*)/g)[0];
  const datePatch = datePatchMatch ?? "Fecha"; // ? datePatchMatch[0] : "Fecha no encontrada"; // ? datePatchMatch[1].trim() : "Fecha no encontrada";
  
  // Extraer el título
  const titlePatchMatch = patchhtml.match(/(?<=PatchNotes-sectionTitle">)([^<]*)/g);
  const titlePatch = titlePatchMatch ?? "Título"; // ? titlePatchMatch[0] : "Título no encontrado";  
  
  // Extraer la descripción
  // const descriptionPatchMatch = patchhtml.match(/(?<=PatchNotes-sectionDescription">)([^<]*)/); // No funciona
  // const descriptionPatchMatch = patchhtml.match(/<div class="PatchNotes-sectionDescription"><p>(.*?)<\/p>/sg); // No funciona
  const descriptionPatchMatch = patchhtml.match(/(?<=<div class="PatchNotes-sectionDescription"><p>)(.*?)(?=<\/p>)/sg); // Solo /g creo que ya funciona
  // const descriptionPatch = descriptionPatchMatch ? descriptionPatchMatch[0] : "Descripción no encontrada"; // ? descriptionPatchMatch[0] : "Descripción no encontrada"; // ? descriptionPatchMatch[1].trim() : "Descripción no encontrada";
  const descriptionPatch = descriptionPatchMatch ?? "Descripción";
  
  // Imprimir los datos
  // console.log('Titulo:', titlePatch) // TE DAMOS LA BIENVENIDA A LA TEMPORADA 9: CAMPEONES
  // console.log('Fecha:', datePatch) // 20 de febrero de 2024
  // console.log('descripción:', descriptionPatch) // ¡Se ha subido nueva información del parche! Para obtener información más detallada sobre el parche, consulte el enlace
  // console.log('Héroe:', heroePatch) // Héroe
  // console.log('Habilidad:', abilityPatch) // Habilidad
  // console.log('Descripción de la habilidad:', descriptionAbilityPatch) // Descripción
  // // console.log('Icono de la habilidad:', iconAbilityPatch) // Icono
 
  if (titlePatch === 'Título') return;
  let date = '';

  // Si la fecha, titulo, descripcion es nula, no se realiza ninguna acción.
  if (!conv) return;
  if (!datePatch) return;
  if (!titlePatch) return;
  if (!descriptionPatch) return;
  // if (!heroePatch) return;
  if (!abilityPatch) return;
  if (!descriptionAbilityPatch) return;
  // if (!iconAbilityPatch) return;

  // Convertir string de fecha del parche
  date = conv.replace('patch-', '');
  patchtime = new Date(date);
  patchurl = `https://overwatch.blizzard.com/news/patch-notes/live/${date.split('-')[0]}/${date.split('-')[1]}/#patch-${date}`;

  let MAX_DESCRIPTION_LENGTH; // Máximo de caracteres admitidos en la descripción de un embed de Discord // Bajo: 1024 // Media: 2048 // Max: 4096 // 649 con - // 644 con - -
  let descriptionEmbed = ``;
  if (!heroePatch) {
    MAX_DESCRIPTION_LENGTH = 2048;
    // TODO: Controlar descripción de embed de noticia general MAX_DESCRIPTION_LENGTH = 2048
    if (titlePatch[0] === 'HERO UPDATES') { titlePatch[0] = 'ACTUALIZACIONES DE HÉROES' };
    if (titlePatch[0] === 'Hotfix Balance Update') { titlePatch[0] = 'Parche de Ajuste de Balance' }; // "Actualización Rápida de Equilibrio"
    
    // if (titlePatch[1] === 'GENERAL UPDATES') { titlePatch[1] = 'ACTUALIZACIONES GENERALES' }; // No existe en el parche
    if (titlePatch[1] === 'TANK') { titlePatch[1] = 'TANQUE' };
        descriptionEmbed += `**${titlePatch[0]}**\n${descriptionPatch[0]}\n**${titlePatch[1]}**\n${descriptionPatch[1]}`;
    } else {
        MAX_DESCRIPTION_LENGTH = 4096;
        // TODO: Controlar descripción de embed de actualización de héroes MAX_DESCRIPTION_LENGTH = 649
        // descriptionEmbed += `**${titlePatch[0]}**\n**${titlePatch[1]}**\n**${heroePatch[0]}**\n${abilityPatch[0]}\n- ${descriptionAbilityPatch[0]}\n**${heroePatch[1]}**\n${abilityPatch[1]}\n- ${descriptionAbilityPatch[1]}\n**${heroePatch[2]}**\n${abilityPatch[2]}\n- ${descriptionAbilityPatch[2]}\n- ${descriptionAbilityPatch[3]}`; //\n**${titlePatch[2]}**\n**${heroePatch[0]}** // Para hacerlo de forma manual

        // // (Una forma de hacerlo) Expresiones regulares para extraer el nombre de los héroes, el nombre de las habilidades y las descripciones de las habilidades
        // const heroRegex = /(?<=PatchNotesHeroUpdate-name">)([^<]*)/g; // Resultado los heroes
        // const abilityRegex = /<div class="PatchNotesAbilityUpdate-name">(.*?)<\/div>/g; // Resultado los divs
        // // const abilityRegex = /<div class="PatchNotesAbilityUpdate-name">([^<]+)<\/div>\s*<div class="PatchNotesAbilityUpdate-detailList">([^<]+)<\/div>/g; // No funciona
        // const descriptionRegex = /<div class="PatchNotesAbilityUpdate-detailList">([\s\S]*?)<\/ul>/g;
        // const generaldescriptionRegex = /<div class="PatchNotesHeroUpdate-generalUpdates">([\s\S]*?)<\/ul>/g; // Nodo especifico para obtener solo las generalUpdates
        // const generalRegex = /<div class="PatchNotesHeroUpdate-body">([\s\S]*?)<\/ul>/g; // Nodo general (Para obtener todo)
        // // const generalUpdateRegex = /<li>([^<]+)<\/li>/g;
        // // const detailRegex = /<ul>(.*?)<\/ul>/g; // li o ul
        // // Buscar todas las coincidencias de nombres de héroes, nombres de habilidades y descripciones de habilidades en el HTML
        // const heroeMatches = patchhtml.match(heroRegex);
        // const abilityMatches = patchhtml.match(abilityRegex);
        // const descriptionMatches = patchhtml.match(descriptionRegex); // detailRegex // generalUpdateRegex // descriptionRegex
        // const generalDescriptionMatches = patchhtml.match(generaldescriptionRegex); // generalRegex // generaldescriptionRegex
        // // console.log('Héroes', heroeMatches)
        // // console.log('Habilidades', abilityMatches)
        // // console.log('Descripción', descriptionMatches)
        // // console.log('Descripción generales:', generalDescriptionMatches)

        
        // (Una forma de hacerlo). Construye el embed de forma manual
        // descriptionEmbed += `**${titlePatch[0]}**\n**${titlePatch[1]}**`;

        // // Recorre los héroes y agrega su nombre junto con su emoji correspondiente
        // for (let i = 0; i < heroePatch.length; i++) {
        //     const hero = heroePatch[i];
        //     const emoji = getEmoji(hero);
        //     descriptionEmbed += `**${titlePatch[i]}**\n${emoji} **${hero}**\n${abilityPatch[i]}\n- ${descriptionAbilityPatch[i]}`;
        // }

        // // Añade descriptionAbilityPatch[3]
        // descriptionEmbed += `\n- ${descriptionAbilityPatch[3]}`;
        // console.log(descriptionEmbed);
        
        
        // (Forma actual de hacerlo) Iterar sobre las coincidencias de nombres de habilidades y descripciones de habilidades y extraer la información
        // Cargar el HTML con cheerio
        const $ = cheerio.load(patchhtml);
        
        // ----------------------------------------------------------------------------------------------------------   
        // // OPCIÓN 1 - (Opción más ordenada pero agrupando habilidades de los héroes por sección (Tanque > Dva, Roadhog > Dva) (No como la del origen)
        // // Declaramos la constante para almacenar los datos de los héroes
        // const heroes = {};

        // // Obtener todos los títulos de sección y sus correspondientes actualizaciones de héroes
        // const sectionTitles = $('.PatchNotes-sectionTitle');

        // // Iterar sobre los títulos de sección
        // sectionTitles.each((index, element) => {
        //     const sectionTitle = $(element).text().trim();
        //     // console.log("Sección:", sectionTitle);

        //     // Buscar las actualizaciones de héroes asociadas a este título de sección
        //     const updatesForSection = $(element).closest('.PatchNotes-section').find('.PatchNotesHeroUpdate');

        //     // Procesar las actualizaciones de héroes bajo este título de sección
        //     updatesForSection.each((i, el) => {
        //         const heroUpdate = $(el);
        //         const heroName = heroUpdate.find('.PatchNotesHeroUpdate-name').text().trim();
        //         const abilitiesList = heroUpdate.find('.PatchNotesHeroUpdate-abilitiesList');
        //         const generalUpdates = heroUpdate.find('.PatchNotesHeroUpdate-generalUpdates');

        //         const heroData = {
        //             name: heroName,
        //             abilities: [],
        //             generalUpdates: []
        //         };

        //         if (abilitiesList.length > 0) {
        //             abilitiesList.find('.PatchNotesAbilityUpdate').each((index, abilityElement) => {
        //                 const abilityName = $(abilityElement).find('.PatchNotesAbilityUpdate-name').text().trim();
        //                 const abilityDetails = $(abilityElement).find('.PatchNotesAbilityUpdate-detailList').text().trim();
        //                 heroData.abilities.push({ name: abilityName, details: abilityDetails });
        //             });
        //         }

        //         if (generalUpdates.length > 0) {
        //             generalUpdates.find('li').each((index, updateElement) => {
        //                 heroData.generalUpdates.push($(updateElement).text().trim());
        //             });
        //         }

        //         // Agregar los datos del héroe a la sección correspondiente
        //         if (!heroes[sectionTitle]) {
        //             heroes[sectionTitle] = [];
        //         }
        //         heroes[sectionTitle].push(heroData);
        //     });
        // });

        // // Imprimir los datos en el orden correspondiente (Opción más ordenada pero no es la misma que el origen de los datos)
        // // Object.keys(heroes).forEach(sectionTitle => {
        // //     console.log(sectionTitle);
        // //     heroes[sectionTitle].forEach(hero => {
        // //         console.log(hero);
        // //     });
        // // });
        // let sectionTitleEmoji = null;
        // // Iterar sobre las secciones y construir la descripción del embed (Opción más ordenada pero no es la misma que el origen de los datos)
        // Object.keys(heroes).forEach(sectionTitle => {
        //     if (sectionTitle === 'TANQUE') { sectionTitleEmoji = 'TANQUE 🛡️' };
        //     if (sectionTitle === 'DAÑO') { sectionTitleEmoji = 'DAÑO ⚔️' };
        //     if (sectionTitle === 'APOYO') { sectionTitleEmoji = 'APOYO 💉' };
        //     descriptionEmbed += `**${sectionTitleEmoji}**\n`; // Agregar el título de la sección
        //     heroes[sectionTitle].forEach(hero => {
        //         const emoji = getEmoji(hero.name);
        //         descriptionEmbed += `${emoji} **${hero.name}**\n`; // Agregar el nombre del héroe
        //         // Agregar las habilidades del héroe
        //         hero.abilities.forEach(ability => {
        //             descriptionEmbed += `${ability.name}\n`; // Agregar nombre de la habilidad
        //             const detailsLines = ability.details.split('\n');
        //             // Agregar detalles de la habilidad con guion para cada línea
        //             detailsLines.forEach(line => {
        //                 descriptionEmbed += `- ${line}\n`;
        //             });
        //         });
        //         // // Agregar las habilidades del héroe
        //         // hero.abilities.forEach(ability => {
        //         //     descriptionEmbed += `- ${ability.name}: ${ability.details}\n`;
        //         // });
        //         // Agregar las actualizaciones generales del héroe
        //         hero.generalUpdates.forEach(update => {
        //             descriptionEmbed += `- ${update}\n`;
        //         });
        //         descriptionEmbed += '\n';
        //     });
        // });
        // console.log(descriptionEmbed);

        // ----------------------------------------------------------------------------------------------------------
        // OPCIÓN 2 - (Ordenado por rol y agrupando habilidades en héroes) (Tanque > Dva, Tanque > Roadhog, Daño > Hanzo) // Esta puede servir para poner el emoji de los roles 🐰Dva🛡️
        // // Declaramos la constante para almacenar los datos de los héroes
        // const heroes = {};

        // // Obtener todos los títulos de sección y sus correspondientes actualizaciones de héroes
        // const sectionTitles = $('.PatchNotes-sectionTitle');

        // // Iterar sobre los títulos de sección
        // sectionTitles.each((index, element) => {
        //     const sectionTitle = $(element).text().trim();
        //     let sectionTitleEmoji = null;

        //     // Definir el emoji para el título de la sección
        //     if (sectionTitle === 'TANQUE') { 
        //         sectionTitleEmoji = '🛡️ TANQUE';
        //     } else if (sectionTitle === 'DAÑO') { 
        //         sectionTitleEmoji = '⚔️ DAÑO';
        //     } else if (sectionTitle === 'APOYO') { 
        //         sectionTitleEmoji = '💉 APOYO';
        //     }
        //     // const heroesInSection = $(element).find('.PatchNotesHeroUpdate');
                    
        //     // heroesInSection.each((i, heroElement) => {
        //     // Buscar las actualizaciones de héroes asociadas a este título de sección
        //     const updatesForSection = $(element).closest('.PatchNotes-section').find('.PatchNotesHeroUpdate');

        //     // Procesar las actualizaciones de héroes bajo este título de sección
        //     updatesForSection.each((i, el) => {
        //         const heroUpdate = $(el);
        //         const heroName = heroUpdate.find('.PatchNotesHeroUpdate-name').text().trim();

        //         // Verificar si ya tenemos información para este héroe
        //         if (!heroes[heroName]) {
        //             heroes[heroName] = {
        //                 abilities: [],
        //                 generalUpdates: [],
        //                 section: sectionTitleEmoji
        //             };
        //         }

        //         const abilitiesList = heroUpdate.find('.PatchNotesHeroUpdate-abilitiesList');
        //         const generalUpdates = heroUpdate.find('.PatchNotesHeroUpdate-generalUpdates');

        //         if (abilitiesList.length > 0) {
        //             abilitiesList.find('.PatchNotesAbilityUpdate').each((index, abilityElement) => {
        //                 const abilityName = $(abilityElement).find('.PatchNotesAbilityUpdate-name').text().trim();
        //                 const abilityDetails = $(abilityElement).find('.PatchNotesAbilityUpdate-detailList').text().trim();
        //                 heroes[heroName].abilities.push({ name: abilityName, details: abilityDetails });
        //             });
        //         }

        //         if (generalUpdates.length > 0) {
        //             generalUpdates.find('li').each((index, updateElement) => {
        //                 heroes[heroName].generalUpdates.push($(updateElement).text().trim());
        //             });
        //         }
        //     });
        // });

        // // Imprimir los datos
        // Object.keys(heroes).forEach(heroName => {
        //     const heroData = heroes[heroName];
        //     console.log(`**${heroData.section}**\n🐰 **${heroName}**\n`);

        //     // Imprimir habilidades
        //     heroData.abilities.forEach(ability => {
        //         console.log(`${ability.name}\n- ${ability.details}\n`);
        //     });

        //     // Imprimir actualizaciones generales
        //     heroData.generalUpdates.forEach(update => {
        //         console.log(`- ${update}\n`);
        //     });
        // });
        
        // ----------------------------------------------------------------------------------------------------------
        // // OPCIÓN 3 - (Orden todo por rol y agrupando habilidades de los heroes, sin tener en cuenta el origen (Tanque > Dva, Roadhog, Daño > Hanzo, Genji, Tanque > Zarya))
        // // Declaramos la constante para almacenar los datos de los héroes
        // const heroes = {};

        // // Variable para almacenar el título de la sección anterior
        // let previousSectionTitleEmoji = null;

        // // Obtener todos los títulos de sección y sus correspondientes actualizaciones de héroes
        // const sectionTitles = $('.PatchNotes-sectionTitle');

        // // Iterar sobre los títulos de sección
        // sectionTitles.each((index, element) => {
        //     const sectionTitle = $(element).text().trim();
        //     let sectionTitleEmoji = null;

        //     // Definir el emoji para el título de la sección
        //     if (sectionTitle === 'TANQUE') { 
        //         sectionTitleEmoji = '🛡️ TANQUE';
        //     } else if (sectionTitle === 'DAÑO') { 
        //         sectionTitleEmoji = '⚔️ DAÑO';
        //     } else if (sectionTitle === 'APOYO') { 
        //         sectionTitleEmoji = '💉 APOYO';
        //     }

        //     // Obtener los héroes dentro de esta sección
        //     const heroesInSection = $(element).closest('.PatchNotes-section').find('.PatchNotesHeroUpdate');

        //     // Procesar los héroes dentro de esta sección
        //     heroesInSection.each((i, el) => {
        //         const heroUpdate = $(el);
        //         const heroName = heroUpdate.find('.PatchNotesHeroUpdate-name').text().trim();

        //         // Verificar si ya tenemos información para este héroe
        //         if (!heroes[heroName]) {
        //             heroes[heroName] = {
        //                 abilities: [],
        //                 generalUpdates: [],
        //                 section: sectionTitleEmoji
        //             };
        //         }

        //         const abilitiesList = heroUpdate.find('.PatchNotesHeroUpdate-abilitiesList');
        //         const generalUpdates = heroUpdate.find('.PatchNotesHeroUpdate-generalUpdates');

        //         if (abilitiesList.length > 0) {
        //             abilitiesList.find('.PatchNotesAbilityUpdate').each((index, abilityElement) => {
        //                 const abilityName = $(abilityElement).find('.PatchNotesAbilityUpdate-name').text().trim();
        //                 const abilityDetails = $(abilityElement).find('.PatchNotesAbilityUpdate-detailList').text().trim();
        //                 heroes[heroName].abilities.push({ name: abilityName, details: abilityDetails });
        //             });
        //         }

        //         if (generalUpdates.length > 0) {
        //             generalUpdates.find('li').each((index, updateElement) => {
        //                 heroes[heroName].generalUpdates.push($(updateElement).text().trim());
        //             });
        //         }
        //     });
        // });

        // // Imprimir los datos y los títulos de las secciones
        // Object.keys(heroes).forEach(heroName => {
        //     const heroData = heroes[heroName];
        //     if (heroData.section && heroData.section !== previousSectionTitleEmoji) {
        //         // console.log(`${heroData.section}\n`); // Imprimir el título de la sección si está definido y es diferente al anterior
        //         descriptionEmbed += `### ${heroData.section}\n`; // Agregar el título de la sección
        //         previousSectionTitleEmoji = heroData.section; // Actualizar el título de la sección anterior
        //     }
        //     const emoji = getEmoji(heroName);
        //     // console.log(`🐰 **${heroName}**\n`); 
        //     descriptionEmbed += `${emoji} **${heroName}**\n`; // Agregar el nombre del héroe
            
        //     // Agregar las habilidades del héroe
        //     heroData.abilities.forEach(ability => {
        //         descriptionEmbed += `- __${ability.name}__\n`; // Agregar nombre de la habilidad
        //         const detailsLines = ability.details.split('\n');
        //         // Agregar detalles de la habilidad con guion para cada línea
        //         detailsLines.forEach(line => {
        //             descriptionEmbed += ` - ${line}\n`;
        //         });
        //     });

        //     // // Imprimir habilidades
        //     // heroData.abilities.forEach(ability => {
        //     //     console.log(`${ability.name}\n- ${ability.details}\n`);
        //     // });

        //     // // Imprimir actualizaciones generales
        //     // heroData.generalUpdates.forEach(update => {
        //     //     console.log(`- ${update}\n`);
        //     // });

        //     // Agregar las actualizaciones generales del héroe a la descripción
        //     heroData.generalUpdates.forEach(update => {
        //         descriptionEmbed += `- ${update}\n`;
        //     });

        //     descriptionEmbed += '\n';
        // });
        // console.log(descriptionEmbed);

        // ----------------------------------------------------------------------------------------------------------

        // // OPCIÓN 4 - (Ordenado por rol respetando el mismo orden del origen) (Tanque > Dva, Roadhog, Daño > Hanzo, Genji))  (Sin las descripciones generales)
        // // Arreglo para almacenar los datos de los héroes en el orden de llegada
        // const heroesData = [];
        
        // // Obtener todas las actualizaciones de héroes
        // const heroUpdates = $('.PatchNotes-section-hero_update');
        
        // // Iterar sobre las actualizaciones de héroes
        // heroUpdates.each((index, element) => {
        //     const sectionTitle = $(element).find('.PatchNotes-sectionTitle').text().trim();
        //     const heroesInSection = $(element).find('.PatchNotesHeroUpdate');
            
        //     heroesInSection.each((i, heroElement) => {
        //         const heroName = $(heroElement).find('.PatchNotesHeroUpdate-name').text().trim();
        //         const abilitiesList = $(heroElement).find('.PatchNotesHeroUpdate-abilitiesList');
        //         const generalUpdates = $(heroElement).find('.PatchNotesHeroUpdate-generalUpdates li');
        
        //         const heroData = {
        //             section: sectionTitle,
        //             name: heroName,
        //             abilities: [],
        //             generalUpdates: []
        //         };
        
        //         if (abilitiesList.length > 0) {
        //             abilitiesList.find('.PatchNotesAbilityUpdate').each((index, abilityElement) => {
        //                 const abilityName = $(abilityElement).find('.PatchNotesAbilityUpdate-name').text().trim();
        //                 const abilityDetails = $(abilityElement).find('.PatchNotesAbilityUpdate-detailList').text().trim();
        //                 heroData.abilities.push({ name: abilityName, details: abilityDetails });
        //             });
        //         }
        
        //         // Agregar las actualizaciones generales del héroe a su objeto de datos
        //         generalUpdates.each((j, updateElement) => {
        //             const updateText = $(updateElement).text().trim();
        //             heroData.generalUpdates.push(updateText);
        //         });
        
        //         // Agregar el héroe al arreglo de datos
        //         heroesData.push(heroData);
        //     });
        // });
        
        // // Construir la descripción del embed
        // // let descriptionEmbed = '';
        // // descriptionEmbed += `**${titlePatch[0]}**\n${descriptionPatch[0]}\n**${titlePatch[1]}**\n${descriptionPatch[1]}`; // Esto solo sirve si queremos que salga una estructura concreta
        descriptionEmbed += `## ${titlePatch[0]}\n`; // ACTUALIZACIONES DE HÉROES // Esto es lo mismo que currentSection
        
        // // Iterar sobre los datos de los héroes y construir la descripción del embed
        // let currentSection = null;
        // let currentSectionEmoji = null;

        // // En vez de usar Object.keys(heroes), usamos heroesData.forEach(heroData => { ... }) para iterar sobre los datos de los héroes
        // heroesData.forEach(heroData => {
        //     // Verificar si la sección ha cambiado
        //     if (heroData.section !== currentSection) {
        //         currentSection = heroData.section;
        //         if (currentSection === 'TANQUE') { currentSectionEmoji = 'TANQUE 🛡️' };
        //         if (currentSection === 'DAÑO') { currentSectionEmoji = 'DAÑO ⚔️' };
        //         if (currentSection === 'APOYO') { currentSectionEmoji = 'APOYO 💉' };
        //         descriptionEmbed += `### ${currentSectionEmoji}\n`; // Agregar el título de la sección // **APOYO 💉** //### 
        //     }
            
        //     const emoji = getEmoji(heroData.name);
        //     descriptionEmbed += `${emoji} **${heroData.name}**\n`; // Agregar el nombre del héroe
        //     // Agregar las habilidades del héroe
        //     heroData.abilities.forEach((ability, index) => {
        //         descriptionEmbed += `- __${ability.name}__\n`; // Agregar nombre de la habilidad
        //         const detailsLines = ability.details.split('\n');
        //         // Agregar detalles de la habilidad con guion para cada línea
        //         detailsLines.forEach((line, lineIndex) => {
        //             descriptionEmbed += ` - ${line}`;
        //             // Controlar espacios entre la descripción de las habilidades
        //             // Verificar si es el último elemento de la última habilidad
        //             if (index === heroData.abilities.length - 1 && lineIndex === detailsLines.length - 1) {
        //                 // Si es el último elemento, no agregar salto de línea
        //             } else {
        //                 // Si no es el último elemento, agregar salto de línea
        //                 descriptionEmbed += '\n';
        //             }
        //         });
        //     });
        //     // Agregar las actualizaciones generales del héroe a la descripción
        //     heroData.generalUpdates.forEach(update => {
        //         descriptionEmbed += `- ${update}\n`;
        //     });

        //     descriptionEmbed += '\n';
        // });
        
        // Imprimir la descripción del embed
        // console.log(descriptionEmbed);
    
  
        // ----------------------------------------------------------------------------------------------------------
        // (OPCIÓN 5) - (Orden todo por rol y agrupando habilidades de los heroes, sin tener en cuenta el origen (Tanque > Dva, Roadhog, Daño > Hanzo, Genji))
        // Declaramos la constante para almacenar los datos de los héroes   
        const heroes = {};
        const heroesData = {};

        // Variable para almacenar el título de la sección anterior
        let previousSectionTitleEmoji = null;

        // Obtener todos los títulos de sección y sus correspondientes actualizaciones de héroes
        const sectionTitles = $('.PatchNotes-sectionTitle');

        // Iterar sobre los títulos de sección
        sectionTitles.each((index, element) => {
            const sectionTitle = $(element).text().trim();
            // let sectionTitleEmoji = null;

            // // Definir el emoji para el título de la sección
            // if (sectionTitle === 'TANQUE') { 
            //     sectionTitleEmoji = '## 🛡️ TANQUE';
            // } else if (sectionTitle === 'DAÑO') { 
            //     sectionTitleEmoji = '## ⚔️ DAÑO';
            // } else if (sectionTitle === 'APOYO') { 
            //     sectionTitleEmoji = '## 💉 APOYO';
            // }

            // Obtener los héroes dentro de esta sección
            const heroesInSection = $(element).closest('.PatchNotes-section').find('.PatchNotesHeroUpdate');

            // Procesar los héroes dentro de esta sección
            heroesInSection.each((i, el) => {
                const heroUpdate = $(el);
                const heroName = heroUpdate.find('.PatchNotesHeroUpdate-name').text().trim();

                // Verificar si ya tenemos información para este héroe
                if (!heroes[heroName]) {
                    heroes[heroName] = {
                        abilities: {},
                        generalUpdates: [],
                        section: sectionTitle // sectionTitleEmoji
                    };
                }

                const abilitiesList = heroUpdate.find('.PatchNotesHeroUpdate-abilitiesList');
                const generalUpdates = heroUpdate.find('.PatchNotesHeroUpdate-generalUpdates');

                if (abilitiesList.length > 0) {
                    abilitiesList.find('.PatchNotesAbilityUpdate').each((index, abilityElement) => {
                        const abilityName = $(abilityElement).find('.PatchNotesAbilityUpdate-name').text().trim();
                        const abilityDetails = $(abilityElement).find('.PatchNotesAbilityUpdate-detailList').text().trim();
                        
                        // Verificar si la habilidad ya existe para este héroe
                        if (!heroes[heroName].abilities[abilityName]) {
                            heroes[heroName].abilities[abilityName] = { name: abilityName, details: abilityDetails };
                        } else {
                            // Si la habilidad ya existe, agregamos los detalles nuevos
                            heroes[heroName].abilities[abilityName].details += `\n${abilityDetails}`;
                        }
                    });
                }

                if (generalUpdates.length > 0) {
                    generalUpdates.find('li').each((index, updateElement) => {
                        heroes[heroName].generalUpdates.push($(updateElement).text().trim());
                    });
                }
            });
        });

        // Objeto para almacenar la información de los héroes agrupada por rol
        // const heroesData = {};

        // Iterar sobre los héroes y agrupar la información por rol
        Object.entries(heroes).forEach(([heroName, heroData]) => { // Si descomento el test de abajo tengo que quitar heroData de esta linea
            // const heroData = heroes[heroName];
            const sectionTitle = heroData.section;
            
            if (!heroesData[sectionTitle]) {
                heroesData[sectionTitle] = [];
            }

            heroesData[sectionTitle].push({ name: heroName, ...heroData });

            // TEST: Modificamos la estructura de datos para incluir el nombre del héroe y sus habilidades
            // heroesData[sectionTitle].push({ 
            //     name: heroName,
            //     abilities: heroData.abilities,
            //     generalUpdates: heroData.generalUpdates
            // });
        });

        // Imprimir los datos y los títulos de las secciones
        Object.entries(heroesData).forEach(([sectionTitle, heroesInSection]) => { // Si descomento el test de abajo tengo que quitar heroesInSection de esta linea
            // const heroesInSection = heroesData[sectionTitle]; // Para test
            // Agregar el título de la sección
            // console.log(`${sectionTitle}`);
            // Verificar si la sección ha cambiado
            if (heroesInSection !== sectionTitle) {
                currentSectionEmoji = sectionTitle;
                if (sectionTitle === 'TANQUE' || sectionTitle === 'Tanques' || sectionTitle === 'Tanque' || sectionTitle === 'Tank') { currentSectionEmoji = 'TANQUE <:tanque:979726195811811348>' }; // 🛡️
                if (sectionTitle === 'DAÑO' || sectionTitle === 'Daños' || sectionTitle === 'Daño' || sectionTitle === 'Damage') { currentSectionEmoji = 'DAÑO <:dps:979742754575896669>' }; // ⚔️
                if (sectionTitle === 'APOYO' || sectionTitle === 'Apoyos' || sectionTitle === 'Apoyo' || sectionTitle === 'Support') { currentSectionEmoji = 'APOYO <:apoyo:979742776495312956>' }; // 💉
                // // Una forma más elegante de hacerlo
                // const sectionMap = new Map([
                //     ['TANQUE', 'TANQUE <:tanque:979726195811811348>'],
                //     ['Tanques', 'TANQUE <:tanque:979726195811811348>'],
                //     ['Tanque', 'TANQUE <:tanque:979726195811811348>'],
                //     ['Tank', 'TANQUE <:tanque:979726195811811348>'],

                //     ['DAÑO', 'DAÑO <:dps:979742754575896669>'],
                //     ['Daños', 'DAÑO <:dps:979742754575896669>'],
                //     ['Daño', 'DAÑO <:dps:979742754575896669>'],
                //     ['Damage', 'DAÑO <:dps:979742754575896669>'],

                //     ['APOYO', 'APOYO <:apoyo:979742776495312956>'],
                //     ['Apoyos', 'APOYO <:apoyo:979742776495312956>'],
                //     ['Apoyo', 'APOYO <:apoyo:979742776495312956>'],
                //     ['Support', 'APOYO <:apoyo:979742776495312956>']
                // ]);
                // const currentSectionEmoji = sectionMap.get(sectionTitle) || '✨ Rol';

                descriptionEmbed += `## ${currentSectionEmoji}\n`; // Agregar el título de la sección // **APOYO 💉** // ## 
                // console.log(`## ${currentSectionEmoji}`);
            }
            heroesInSection.forEach(heroData => {
                const emoji = getEmoji(heroData.name);
                // console.log(`${emoji} **${heroData.name}**`); // Agregar el nombre del héroe
                descriptionEmbed += `${emoji} **${heroData.name}**\n`; // Agregar el nombre del héroe // Se le puede poner ### pero hay que comentar el espacio \n de abajo

                // Agregar las habilidades del héroe
                Object.values(heroData.abilities).forEach(ability => {
                    let abilityName = ability.name;

                    // Verificar si la habilidad existe
                    if (!abilityName) {
                        // Si no existe, llamamos a la habilidad "Habilidad"
                        abilityName = 'Habilidad';
                    }
                    // console.log(`- __${abilityName}__`); // Imprimir nombre de la habilidad
                    descriptionEmbed += `- __${abilityName}__\n`; // Agregar nombre de la habilidad
                    const detailsLines = ability.details.split('\n');
                    // Agregar detalles de la habilidad con guion para cada línea
                    detailsLines.forEach(line => {
                        // console.log(` - ${line}`);

                        // Op1. Para sustituir caracteres extraños por nada
                        // const cleanedLine = line.replace('• ', ''); // Reemplazar '• ' por ''
                        // console.log(` - ${cleanedLine}`);

                        // Opt2. Para sustituir puntos adicionales por '\n' y meter saltos de lines (Evitar errores del origen)
                        const cleanedLine = line.replace('• ', '').replace(/(• )/g, '\n - '); // Reemplazar '• ' por '' y los puntos adicionales por '\n'
                        // console.log(` - ${cleanedLine}`);
                        descriptionEmbed += ` - ${cleanedLine}\n`; // Agregar detalles de la habilidad con un guión para cada línea
                    });
                });

                // Agregar las actualizaciones generales del héroe a la descripción 
                // TODO: Si lo queremos agregar antes que las descripciones tenemos que controlar que si un heroe no lo tiene no lo agregue
                heroData.generalUpdates.forEach(update => {
                    // console.log(`- ${update}`);
                    descriptionEmbed += `- ${update}\n`; // Agregar las actualizaciones generales del héroe a la descripción
                });

                // console.log('\n');
                descriptionEmbed += '\n'; // Si pongo los héroes ##Zarya hay que comentar esta línea
            });
            // console.log('\n');
            // descriptionEmbed += '\n';
        });

        // Imprimir el resultado
        // console.log(heroesData);
        // console.log(heroes);
        // console.log(descriptionEmbed)
    }
    // // Opt 0. Verificar si la longitud de la descripción excede el límite máximo en un solo embed
    // if (descriptionEmbed.length > MAX_DESCRIPTION_LENGTH) {
    //     // Truncar la descripción si es demasiado larga
    //     descriptionEmbed = descriptionEmbed.slice(0, MAX_DESCRIPTION_LENGTH - 3) + '...';
    // }

    // // Opt1. Función para dividir el contenido en partes más pequeñas
    // function chunkString(str, length) {
    //     const chunks = [];
    //     let index = 0;
    
    //     while (index < str.length) {
    //         const chunk = str.substr(index, length);
    //         const lastWhitespaceIndex = chunk.lastIndexOf(' ');
    
    //         if (lastWhitespaceIndex !== -1) {
    //             // Ajustar el chunk para que termine en el último espacio en blanco
    //             chunks.push(chunk.substr(0, lastWhitespaceIndex + 1));
    //             index += lastWhitespaceIndex + 1;
    //         } else {
    //             // Si no hay espacios en blanco, dividir en el límite de longitud
    //             chunks.push(chunk);
    //             index += length;
    //         }
    //     }
    
    //     return chunks;
    // }
    
    // // Dividir el contenido en partes más pequeñas
    // const chunks = chunkString(descriptionEmbed, 4096); // Cambia 1000 al tamaño máximo de caracteres por cada parte de descripción que desees

    // // Opt2. Dividir el contenido en partes más pequeñas según las secciones de roles (Tanque, Daño, Apoyo)

    // const chunks = descriptionEmbed.split("##").filter(chunk => chunk.trim() !== ""); // Solo puedo usar esto para poner una marca a algo y dividirlo eliminando la marca ###
    // Dividir el contenido en tres secciones
    // const chunks = descriptionEmbed.split(/\n(?=### )/).filter(chunk => chunk.trim() !== ""); // Sirve para encontrar lo que contenga '## ' y separarlo

    // Dividir el texto teniendo en cuenta los dos primeros titulos de sección // Para que salga también ## ACTUALIZACIONES DE HÉROES (Titulos más grandes)
    const dividir = descriptionEmbed.split(/\n(?=## )/);

    // Fusionar los primeros dos titulos en un fragmento
    const firstChunk = dividir.shift() + '\n' + dividir.shift();

    // Reunir el primer fragmento con el resto
    const chunks = [firstChunk, ...dividir];
    // console.log(chunks)
    // Embed
    // chunks.forEach(async chunk => {
    // const embed = {
    //     author: {
    //         name: 'Overwatch 2',
    //         icon_url: 'https://images-ext-1.discordapp.net/external/tTKzALJXJSHXWduLkHt9hT_d_obdeFHQ_cyx5-EpIQ8/https/cdn.patchbot.io/games/106/overwatch_2_sm.webp?format=webp&width=312&height=312',
    //         url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
    //     },
    //     // color: 0xfb923c, // Naranja
    //     // color: 0x60a5fa, // Azul
    //     // color: 0x00ff00, // Verde
    //     // color: 0xff0000, // Rojo
    //     color: 0xffffff, // Blanco
    //     url: patchurl,
    //     // title: `Información del parche de Overwatch 2 - ${patchtime.getDate()}/${patchtime.getMonth() + 1}/${patchtime.getFullYear()}`,
    //     title: `${datePatch}`,
    //     // description: '¡Se ha subido nueva información del parche! Para obtener información más detallada sobre el parche, consulte el enlace',
    //     // description: chunks, // descriptionEmbed,
    //     // thumbnail: {
    //     //     url: 'https://comunidadoverwatch.com/wp-content/uploads/2024/03/overwatch_2_sm.webp' // ?format=webp&width=312&height=312 // 'https://cdn.patchbot.io/games/106/overwatch_2_sm.webp?format=webp&width=312&height=312'
    //     // },
    //     // timestamp: new Date().toISOString()
    // };

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
        enviarChunks();
        // await channel.send({ embeds: [embed], components: [row] });
    }

    // Cuando está en la base de datos y la fecha es posterior
    else {
        if (patchtime > new Date(patchData.patch_date)) {
            const db = await Patch.update({ patch_date: date }, { where: { patch_date: patchData.patch_date }});
            db;
            enviarChunks();
            // await channel.send({ embeds: [embed], components: [row] });
        }
    }
    async function enviarChunks() {
        // Controlar el último embed de longitud pequeña
        // Umbral mínimo para la longitud del fragmento
        const MIN_FRAGMENT_LENGTH = 20; // Ajusta este valor según tus necesidades

        // Verificar si el último fragmento es demasiado corto
        if (chunks.length > 1 && chunks[chunks.length - 1].length < MIN_FRAGMENT_LENGTH) {
            // Fusionar el último fragmento con el penúltimo
            chunks[chunks.length - 2] += chunks[chunks.length - 1];
            // Eliminar el último fragmento
            chunks.pop();
        }
        let isFirstEmbed = true;
        // Iterar sobre cada chunk y enviarlo individualmente
        chunks.forEach(async (chunk, index) => {
            // Verificar si la longitud de la descripción excede el límite máximo de cada embed
            if (chunk.length > MAX_DESCRIPTION_LENGTH) {
                // Truncar la descripción si es demasiado larga
                chunk = chunk.slice(0, MAX_DESCRIPTION_LENGTH - 3) + '...';
            }
            const embed = {
                description: chunk, // Utiliza la variable chunk aquí
                color: 0xffffff, // Blanco
            };
        
            // Si es el primer embed, agregar el autor y el título
            if (isFirstEmbed) {
                embed.author = {
                    name: 'Overwatch 2',
                    icon_url: 'https://images-ext-1.discordapp.net/external/tTKzALJXJSHXWduLkHt9hT_d_obdeFHQ_cyx5-EpIQ8/https/cdn.patchbot.io/games/106/overwatch_2_sm.webp?format=webp&width=312&height=312',
                    url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
                };
                embed.color = 0xffffff; // Blanco
                embed.url = patchurl; // Supongo que patchurl es una variable definida en tu código
                embed.title = `${datePatch}`; // Supongo que datePatch es una variable definida en tu código
                isFirstEmbed = false; // Cambiar el estado del primer embed
            }
                // Enviar el embed
                if (index === chunks.length - 1) {
                    // Si es el último elemento, añadir los componentes
                    await channel.send({ embeds: [embed], components: [row] });
                } else {
                    // Si no es el último elemento, enviar solo el embed
                    await channel.send({ embeds: [embed] });
                }
                // Enviar el embed y los componentes
                // await channel.send({ embeds: [embed], components: [row] });
        });
    }
    
        return;
    } catch (error) {
        console.error('Error en alguna variable:', error)
    }
}

module.exports = { OverPatchCron }; // GetPatchData, GetPatchDataNow, (TODO: Para exportarlo en el futuro para usar en un comando)