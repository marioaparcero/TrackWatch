const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const { OverPatch } = require('../lib/overwatch/overpatch.js');
// const { formatHeroes } = require("../utils/emojis");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('parche')
        .setDescription('Notas del parche más reciente de Overwatch'),
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

            // Función para dividir contenido por secciones de títulos
            function chunkString(descriptionEmbed, maxLength) {
                // Dividir el texto teniendo en cuenta los primeros títulos de sección
                // Para que lo primero salga ## ACTUALIZACIONES DE HÉROES (Títulos más grandes)
                const dividir = descriptionEmbed.split(/\n(?=## )/);
                
                // Verificar si hay al menos 2 elementos para fusionar
                if (dividir.length >= 2) {
                    // Fusionar los primeros dos títulos en un fragmento
                    const firstChunk = dividir.shift() + '\n' + dividir.shift();
                    // Reunir el primer fragmento con el resto
                    var chunks = [firstChunk, ...dividir];
                } else {
                    // Si no hay suficientes secciones, usar todo como un chunk
                    var chunks = dividir;
                }

                // Verificar si algún chunk excede el límite y dividirlo si es necesario
                const finalChunks = [];
                for (let chunk of chunks) {
                    if (chunk.length > maxLength) {
                        // Si un chunk es muy largo, dividirlo por líneas
                        const lines = chunk.split('\n');
                        let currentChunk = '';
                        
                        for (const line of lines) {
                            if (currentChunk.length + line.length + 1 > maxLength) {
                                if (currentChunk) {
                                    finalChunks.push(currentChunk.trim());
                                    currentChunk = line;
                                } else {
                                    // Si una sola línea es demasiado larga, truncarla
                                    finalChunks.push(line.substring(0, maxLength - 3) + '...');
                                }
                            } else {
                                currentChunk += (currentChunk ? '\n' : '') + line;
                            }
                        }
                        
                        if (currentChunk) {
                            finalChunks.push(currentChunk.trim());
                        }
                    } else {
                        finalChunks.push(chunk.trim());
                    }
                }

                return finalChunks;
            }

            // Función para enviar chunks como embeds separados (adaptada de enviarChunks)
            async function enviarChunksComando(chunks, result, interaction) {
                const MAX_DESCRIPTION_LENGTH = 4096;
                const MIN_FRAGMENT_LENGTH = 20;

                // Verificar si el último fragmento es demasiado corto
                if (chunks.length > 1 && chunks[chunks.length - 1].length < MIN_FRAGMENT_LENGTH) {
                    // Fusionar el último fragmento con el penúltimo
                    chunks[chunks.length - 2] += '\n' + chunks[chunks.length - 1];
                    // Eliminar el último fragmento
                    chunks.pop();
                }

                // Crear el botón para ir a las notas completas
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Ver notas completas del parche')
                        .setStyle('Link')
                        .setURL(result.patchUrl || 'https://overwatch.blizzard.com/es-es/news/patch-notes/live')
                );

                let isFirstEmbed = true;

                // Enviar el primer embed como respuesta inicial
                for (let index = 0; index < chunks.length; index++) {
                    let chunk = chunks[index];

                    // Verificar si la longitud de la descripción excede el límite máximo
                    if (chunk.length > MAX_DESCRIPTION_LENGTH) {
                        // Truncar la descripción si es demasiado larga
                        chunk = chunk.slice(0, MAX_DESCRIPTION_LENGTH - 3) + '...';
                    }

                    const embed = {
                        description: chunk,
                        // description: formatHeroes(chunk),
                        color: 0xffffff
                    };

                    // Si es el primer embed, agregar el autor y el título
                    if (isFirstEmbed) {
                        embed.author = {
                            name: 'Overwatch',
                            icon_url: 'https://images-ext-1.discordapp.net/external/4FuuxocaKy80RYDS27BxMgI_2KnunfafT0XMziE4vLY/https/cdn.patchbot.io/games/106/overwatch-2_1770906990_sm.webp?format=webp&width=240&height=240',
                            url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
                        };
                        embed.url = result.patchUrl;
                        embed.title = `📝 ${result.date || 'Notas del parche de Overwatch'}`;
                        // embed.timestamp = new Date().toISOString();

                        // Enviar como respuesta inicial
                        if (index === chunks.length - 1) {
                            // Si es el único/último elemento, añadir los componentes
                            await interaction.editReply({ 
                                embeds: [embed], 
                                components: [row],
                                ephemeral: true 
                            });
                        } else {
                            // Si no es el último elemento, enviar sin componentes
                            await interaction.editReply({ 
                                embeds: [embed],
                                ephemeral: true 
                            });
                        }

                        isFirstEmbed = false;
                    } else {
                        // Para los embeds siguientes, usar followUp
                        if (index === chunks.length - 1) {
                            // Si es el último elemento, añadir los componentes
                            await interaction.followUp({ 
                                embeds: [embed], 
                                components: [row],
                                ephemeral: true 
                            });
                        } else {
                            // Si no es el último elemento, enviar solo el embed
                            await interaction.followUp({ 
                                embeds: [embed],
                                ephemeral: true 
                            });
                        }
                    }
                }
            }

            const MAX_DESCRIPTION_LENGTH = 4096;
            let descriptionText = result.description || '';

            // Si la descripción es muy larga, dividirla en chunks
            const chunks = chunkString(descriptionText, MAX_DESCRIPTION_LENGTH);

            // Si hay contenido, enviarlo
            if (chunks.length > 0) {
                await enviarChunksComando(chunks, result, interaction);
            } else {
                // Si no hay contenido, enviar un mensaje básico
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Ver notas completas del parche')
                        .setStyle('Link')
                        .setURL(result.patchUrl || 'https://overwatch.blizzard.com/es-es/news/patch-notes/live')
                );

                const embed = {
                    author: {
                        name: 'Overwatch',
                        icon_url: 'https://images-ext-1.discordapp.net/external/4FuuxocaKy80RYDS27BxMgI_2KnunfafT0XMziE4vLY/https/cdn.patchbot.io/games/106/overwatch-2_1770906990_sm.webp?format=webp&width=240&height=240',
                        url: 'https://playoverwatch.com/es-es/news/patch-notes/live'
                    },
                    color: 0xffffff,
                    title: `📝 ${result.date || 'Notas del parche de Overwatch'}`,
                    description: 'No se encontraron notas del parche. Consulta el enlace para más información.',
                    url: result.patchUrl,
                    timestamp: new Date().toISOString()
                };

                await interaction.editReply({ 
                    embeds: [embed], 
                    components: [row],
                    ephemeral: true 
                });
            }

        } catch (error) {
            console.error('Error en comando parche:', error);
            
            const errorMessage = {
                content: 'Se ha producido un error al obtener las notas del parche. Inténtalo de nuevo en unos minutos.', 
                ephemeral: true 
            };
            
            if (interaction.deferred) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};
