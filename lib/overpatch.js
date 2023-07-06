const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { OverPatchDB } = require('../db/overpatch.js');

// Config
const { patchchannel } = require("../config.json");

// Get HTML Body Data
const GetData = async () => {
  try {
    const res = await fetch(`https://overwatch.blizzard.com/ko-kr/news/patch-body/live/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/`);
    const body = await res.text();

    return body.length ? body : null;
  } catch (error) {
    return console.error(error);
  }
};

const OverPatchCron = async (client) => {
  const channel = client.channels.cache.get(patchchannel);
  const patchhtml = await GetData();

  const root = HTMLParser.parse(patchhtml);
  const conv = root.querySelector('.PatchNotes-patch');

  let date = '';

  // if date is null, pass it.
  if (!conv) return;

  // convert patch date string
  date = conv.firstChild.id.replace('patch-', '');
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
  const patchData = await OverPatchDB.findOne({
    where: {
      patch_date: date
    }
  });

  // not in DB
  if (!patchData) {
    await OverPatchDB.create({
      patch_date: date,
    });

    await channel.send({ embeds: [embed], components: [row] });
  }
  // in DB
  else {
    if (patchtime > new Date(patchData.patch_date)) {
      await OverPatchDB.update({ patch_date: date }, {
        where: {
          patch_date: patchData.patch_date,
        }
      });

      await channel.send({ embeds: [embed], components: [row] });
    }
  }

  return;
}

module.exports = { OverPatchCron };