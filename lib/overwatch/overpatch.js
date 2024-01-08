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
  const patchhtml = await GetPatchData(language);

  const conv = patchhtml.match(/(?<=id=\")([^"]*)(?=\")/g)[0];

  let date = '';

  // if date is null, pass it.
  if (!conv) return;

  // convert patch date string
  date = conv.replace('patch-', '');
  patchtime = new Date(date);
  patchurl = `https://overwatch.blizzard.com/ko-kr/news/patch-notes/live/${date.split('-')[0]}/${date.split('-')[1]}/#patch-${date}`;

  // Embed
  const embed = {
    color: 0xfb923c,
    url: patchurl,
    title: `오버워치 2 패치 정보 - ${patchtime.getFullYear()}년 ${patchtime.getMonth() + 1}월 ${patchtime.getDate()}일`,
    description: '신규 패치 정보가 올라왔습니다! 더 자세한 패치 정보는 해당 링크에서 확인해 주세요',
    timestamp: new Date().toISOString()
  };

  // Links
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('오버워치 2 패치 노트로 이동')
      .setStyle('Link')
      .setURL(patchurl),
    );
    
    // Get shop ID from DB
    const patchData = await Patch.findOne({ where: { patch_date: date }});
  
    // not in DB
    if (!patchData) {
        const db = await Patch.create({ patch_date: date });
        db;
        await channel.send({ embeds: [embed], components: [row] });
    }
    // in DB
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