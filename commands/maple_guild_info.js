const fetch = require('node-fetch');
const cheerio = require('cheerio');
const mapleModule = require('../util/maple_parsing');
const { sleep } = require('../admin/bot_control');
const serverEngName = {
    스카니아: 'scania',
    베라: 'bera',
    루나: 'luna',
    제니스: 'zenith',
    크로아: 'croa',
    유니온: 'union',
    엘리시움: 'elysium',
    이노시스: 'enosis',
    레드: 'red',
    오로라: 'aurora',
    아케인: 'arcane',
    노바: 'nova',
    리부트: 'reboot',
    리부트2: 'reboot2'
};

async function updateGuild(guildURL) {
    const start = Date.now();
    while (1) {
        try {
            const rslt = await (await fetch(`${guildURL}/sync`)).json();
            if (rslt.done) {
                return true; // 갱신성공
            } else if (rslt.error) {
                return false; // 갱신실패
            }
        } catch (e) {
            return false; // 갱신실패
        }
        if (Date.now() - start >= 20000) {
            return false; // 20초가 지나도 갱신 못했으면 갱신실패 판정
        }
        await sleep(100);
    }
}

module.exports = {
    usage: `${client.prefix}길드 (서버 이름) (길드 이름)`,
    command: ['길드', 'ㄱㄷ'],
    description: '- 입력한 내용에 해당하는 길드의 길드원 정보(직위, 직업, 레벨, 유니온, 무릉)를 보여줍니다.',
    type: ['메이플'],
    async execute(message, args) {
        if (args.length != 2 || !serverEngName[args[0]]) {
            return message.channel.send(`${this.usage}\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const guildURL = `https://maple.gg/guild/${serverEngName[args[0]]}/${encodeURIComponent(args[1])}`;
        const isLatest = await updateGuild(guildURL);
        const $ = cheerio.load(await (await fetch(`${guildURL}/members?sort=level`)).text());
        if ($('div.alert.alert-warning.mt-3').length != 0) {
            throw new Error('메이플 GG 서버가 점검 중입니다.');
        } else if (/Bad Gateway|Error/.test($('title').text()) || $('div.flex-center.position-ref.full-height').length != 0) {
            throw new Error('메이플 GG 서버에 에러가 발생했습니다.');
        }

        const memberData = $('.pt-2.bg-white.rounded.border.font-size-0.line-height-1');
        const memberCount = memberData.length;
        if (memberCount == 0) {
            return message.channel.send('존재하지 않는 길드입니다.');
        }

        message.channel.send('정보 가져오는 중...');
        let rslt = `${args[0]} ${args[1]} 길드 (${memberCount}명)\n길드원 목록 갱신 ${isLatest ? '성공' : '실패'}`;
        const memberList = memberData.map((i, v) => new mapleModule($(v).find('.mb-2 a').eq(1).text()));
        const updateRslt = await Promise.all(memberList.map(async (i, v) => (await v.isLatest()) || (await v.updateGG())));
        for (let i = 0; i < memberCount; i++) {
            rslt += `\n\n[갱신 ${updateRslt[i] ? '성공' : '실패'}] ${memberData.eq(i).find('header > span').text() || '길드원'}: ${memberList[i].Name}, ${memberList[i].Job()} / Lv.${memberList[i].Level()}, 유니온: ${memberList[i].Union()?.[0].toLocaleString() ?? '-'}, 무릉: ${memberList[i].Murung()?.[1] ?? '-'} (${memberList[i].lastActiveDay()})`;
        }

        return message.channel.send(rslt, { split: true });
    }
};
