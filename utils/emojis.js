// Objeto que mapea los nombres de los héroes a sus emojis correspondientes
const emojis = {
    'Domina': '<:domina:1470878591100125205>',
    'Anran': '<:anran:1470878534334677093>',
    'Emre': '<:emre:1470878619416002866>',
    'Jetpack Cat': '<:jetpackcat:1470878648113434646>',
    'Mizuki': '<:mizuki:1470878820621090849>',
    'D.Va': '<:dva:735555762734104726>',
    'Roadhog': '<:roadhog:735555506940412044>',
    'Zarya': '<:zarya:735555560245559347>',
    'Hanzo': '<:hanzo:817773638647676928>',
    'Junkrat': '<:junkrat:735555216363094098>',
    'Soldado: 76': '<:soldado76:735555717234294865>',
    'Soldier: 76': '<:soldado76:735555717234294865>',
    'Tracer': '<:tracer:817776337234165790>',
    'Widowmaker': '<:widowmaker:735555840169345136>',
    'Illari': '<:illari:1141824878979321906>',
    'Lúcio': '<:lucio:817777930531897346>',
    'Lucio': '<:lucio:817777930531897346>',
    'Mercy': '<:mercy:735555360668254256>',
    'Wuyang': '<:wuyang:1405664483120250941>',
    'Zenyatta': '<:zenyatta:817778858652598272>',
    'Doomfist': '<:doomfist:735555778647293972>',
    'Junker Queen': '<:junkerqueen:1031737097809305621>',
    'Junkerqueen': '<:junkerqueen:1031737097809305621>',
    'Mauga': '<:mauga:1209910728270544926>',
    'Orisa': '<:orisa:735555395610738792>',
    'Ramattra': '<:ramattra:1055912552976105502>',
    'Reinhardt': '<:reinhardt:735555523684073612>',
    'Sigma': '<:sigma:991400349145501786>',
    'Winston': '<:winston:735555573646622842>',
    'Wrecking Ball': '<:wreckingball:735555646602084362>',
    'Ashe': '<:ashe:817774431731581018>',
    'Bastion': '<:bastionpio:991399746495328256>',
    'Cassidy': '<:cassidy:735555854371258531>',
    'Echo': '<:echo:817773566233280532>',
    'Freja': '<:freja:1369685053495574619>',
    'Genji': '<:genji:817773792901988352>',
    'Mei': '<:mei:845992873488678973>',
    'Pharah': '<:pharah:735555275137876010>',
    'Reaper': '<:reaper1:991398767704146021>',
    'Sojourn': '<:sojourn:1031737082340720782>',
    'Sombra': '<:sombra:735555409485496411>',
    'Symmetra': '<:symmetra:845993408023887895>',
    'Torbjörn': '<:torbjorn:735555545469026357>',
    'Ana': '<:ana:735555677279223819>',
    'Baptiste': '<:baptiste:845993713285333002>',
    'Brigitte': '<:brigitte:735555616780714096>',
    'Kiriko': '<:kiriko:1031736769961545828>',
    'Lifeweaver': '<:lifeweaver:1117145455390892134>',
    'Moira': '<:moira:735555820749717657>',
    'Juno': '<:juno:1267575692288327702>',
    'Vendetta': '<:vendetta:1449067095282286734>',
    'Venture': '<:venture:1235319765950664845>',
    'Hazard': '<:hazard:1322282245884739695>'
};

// const emojis = {
//     'D.Va': '🐰',
//     'Roadhog': '🐷',
//     'Zarya': '💪',
//     'Hanzo': '🏹',
//     'Junkrat': '💣',
//     'Soldado: 76': '👨‍✈️',
//     'Tracer': '⚡',
//     'Widowmaker': '🕷️',
//     'Illari': '🦋',
//     'Lúcio': '🎵',
//     'Mercy': '💉',
//     'Zenyatta': '🔮',
//     'Doomfist': '🤜',
//     'Junker Queen': '👑',
//     'Mauga': '🛡️',
//     'Orisa': '🐴',
//     'Ramattra': '🌊',
//     'Reinhardt': '🛡️',
//     'Sigma': '🔷',
//     'Winston': '🐵',
//     'Wrecking Ball': '🔨',
//     'Ashe': '🤠',
//     'Bastion': '🤖',
//     'Cassidy': '🤠',
//     'Echo': '🦢',
//     'Genji': '🐉',
//     'Mei': '🌨️',
//     'Pharah': '🚀',
//     'Reaper': '💀',
//     'Sojourn': '👩‍✈️',
//     'Sombra': '🕵️‍♀️',
//     'Symmetra': '🔶',
//     'Torbjörn': '🔨',
//     'Ana': '💤',
//     'Baptiste': '💊',
//     'Brigitte': '🛡️',
//     'Kiriko': '🐲',
//     'Lifeweaver': '🌱',
//     'Moira': '👁️'
// };

// Función que recibe texto y reemplaza nombres de héroes por nombre+emoji (reemplazar héroe por héroe + emoji)
function formatHeroes(text) {
    if (!text) return "N/A";

    // Recorremos cada héroe definido en emojis y hacemos replace
    for (const hero in emojis) {
        const regex = new RegExp(`\\b${hero}\\b`, "g"); // \b asegura coincidencia exacta
        text = text.replace(regex, `${hero} ${emojis[hero]}`);
    }

    return text;
}

// Función para obtener el emoji correspondiente a un héroe
function getEmoji(hero) {
    // Verifica si el héroe tiene un emoji asociado en el objeto emojis
    return emojis[hero] || ''; // Devuelve el emoji correspondiente o una cadena vacía si no hay ningún emoji asociado
}

module.exports = { emojis, formatHeroes, getEmoji };
