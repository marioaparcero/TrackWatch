const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { OverPatch } = require('../lib/overwatch/overpatch.js');
// const { formatHeroes } = require("../utils/emojis");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('parche')
        .setDescription('Notas del parche más reciente de Overwatch 2'),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const result = await OverPatch();
            
            if (!result) {
                return await interaction.editReply({ 
                    content: "Se produjo un error al cargar los datos del parche.", 
                    ephemeral: true 
                });
            }

            // Función para dividir contenido en chunks si es muy largo
            function chunkString(str, maxLength) {
                const chunks = [];
                const lines = str.split('\n');
                let currentChunk = '';

                for (const line of lines) {
                    // Si añadir esta línea haría que el chunk sea demasiado largo
                    if (currentChunk.length + line.length + 1 > maxLength) {
                        if (currentChunk) {
                            chunks.push(currentChunk.trim());
                            currentChunk = line;
                        } else {
                            // Si una sola línea es demasiado larga, truncarla
                            chunks.push(line.substring(0, maxLength - 3) + '...');
                        }
                    } else {
                        currentChunk += (currentChunk ? '\n' : '') + line;
                    }
                }

                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }

                return chunks;
            }

            const MAX_DESCRIPTION_LENGTH = 4096;
            let descriptionText = result.description || '';

            // Si la descripción es muy larga, dividirla en chunks
            const chunks = chunkString(descriptionText, MAX_DESCRIPTION_LENGTH);

            // Crear el botón para ir a las notas completas
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Ver notas completas del parche')
                    .setStyle('Link')
                    .setURL(result.patchUrl || 'https://overwatch.blizzard.com/es-es/news/patch-notes/live')
            );

            // Si solo hay un chunk, enviar un embed simple
            if (chunks.length === 1) {
                const embed = {
                    author: {
                        name: 'Overwatch 2',
                        icon_url: 'https://images-ext-1.discordapp.net/external/tTKzALJXJSHXWduLkHt9hT_d_obdeFHQ_cyx5-EpIQ8/https/cdn.patchbot.io/games/106/overwatch_2_sm.webp?format=webp&width=312&height=312',
                        url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
                    },
                    color: 0xffffff,
                    title: `📝 ${result.date || 'Notas del parche de Overwatch 2'}`,
                    // description: formatHeroes(chunks[0]),
                    description: chunks[0],
                    url: result.patchUrl,
                    timestamp: new Date().toISOString()
                };

                await interaction.editReply({ 
                    embeds: [embed], 
                    components: [row],
                    ephemeral: true 
                });
            } 
            // Si hay múltiples chunks, enviar múltiples embeds
            else {
                const embeds = chunks.map((chunk, index) => {
                    const embed = {
                        color: 0xffffff,
                        // description: formatHeroes(chunk)
                        description: chunk
                    };

                    // Solo el primer embed tiene autor, título y timestamp
                    if (index === 0) {
                        embed.author = {
                            name: 'Overwatch 2',
                            icon_url: 'https://images-ext-1.discordapp.net/external/tTKzALJXJSHXWduLkHt9hT_d_obdeFHQ_cyx5-EpIQ8/https/cdn.patchbot.io/games/106/overwatch_2_sm.webp?format=webp&width=312&height=312',
                            url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
                        };
                        embed.title = `📝 ${result.date || 'Notas del parche de Overwatch 2'}`;
                        embed.url = result.patchUrl;
                        embed.timestamp = new Date().toISOString();
                    }

                    return embed;
                });

                // Discord permite máximo 10 embeds por mensaje
                const maxEmbedsPerMessage = 10;
                
                if (embeds.length <= maxEmbedsPerMessage) {
                    await interaction.editReply({ 
                        embeds: embeds, 
                        components: [row],
                        ephemeral: true 
                    });
                } else {
                    // Si hay más de 10 embeds, enviar solo los primeros 10 y truncar
                    const truncatedEmbeds = embeds.slice(0, maxEmbedsPerMessage);
                    truncatedEmbeds[maxEmbedsPerMessage - 1].description += '\n\n*...contenido truncado. Ver enlace para información completa.*';
                    
                    await interaction.editReply({ 
                        embeds: truncatedEmbeds, 
                        components: [row],
                        ephemeral: true 
                    });
                }
            }

        } catch (error) {
            console.error('Error en comando parche:', error);
            
            const errorMessage = interaction.deferred 
                ? { content: 'Se ha producido un error al obtener las notas del parche. Inténtalo de nuevo en unos minutos.', ephemeral: true }
                : { content: 'Se ha producido un error al obtener las notas del parche. Inténtalo de nuevo en unos minutos.', ephemeral: true };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};