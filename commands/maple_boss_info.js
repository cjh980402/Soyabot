const { MessageEmbed } = require('../util/discord.js-extend');
const { bossData } = require('../util/soyabot_const.json');
const fetch = require('node-fetch');
const bossNameList = {
    세렌: '선택받은 세렌',
    검은마법사: '검은 마법사',
    가디언엔젤슬라임: '가디언 엔젤 슬라임',
    블러디퀸: '블러디 퀸'
};
const difficultyList = {
    하드: 'hard',
    카오스: 'chaos',
    노말: 'normal',
    이지: 'easy'
};

async function getBossEmbed(bossName, bossGrade) {
    const targetBoss = bossData[bossName][bossGrade];

    try {
        const params = new URLSearchParams();
        params.append('boss', bossNameList[bossName] ?? bossName);
        params.append('difficulty', difficultyList[bossGrade]);
        const data = await (
            await fetch('http://wachan.me/boss_api.php', {
                method: 'POST',
                body: params
            })
        ).json();
        targetBoss[0][0] = `결정석 메소: ${data.result.meso.replace(/%20/g, ' ').replace(/%2B/g, '+')}`;
    } catch {
        targetBoss[0][0] += ' (패치 전)';
    }

    return new MessageEmbed()
        .setTitle(`**${bossName}(${bossGrade})의 보상 / 정보**`)
        .setColor('#FF9999')
        .setDescription(`**보상**\n${targetBoss[0].join('\n\n')}\n\n**정보**\n${targetBoss[1].join('\n\n')}`);
}

module.exports = {
    usage: `${client.prefix}보스 (보스 이름) (보스 난이도)`,
    command: ['보스', 'ㅂㅅ', 'ㅄ'],
    description: '- 해당하는 보스의 보상과 체력, 방어율을 알려줍니다.\n- 난이도를 생략하면 상위 등급의 정보를 보여줍니다.',
    type: ['메이플'],
    async messageExecute(message, args) {
        if (!args[0]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const bossName = args[0];
        if (!bossData[bossName]) {
            return message.channel.send('데이터가 없는 보스입니다.');
        }
        const bossGrade = !bossData[bossName][args[1]] ? Object.keys(bossData[bossName])[0] : args[1];

        return message.channel.send({ embeds: [await getBossEmbed(bossName, bossGrade)] });
    },
    commandData: {
        name: '보스',
        description: '해당하는 보스의 보상과 체력, 방어율을 알려줍니다.',
        options: [
            {
                name: '보스_이름',
                type: 'STRING',
                description: '보스 정보를 검색할 보스의 이름',
                required: true
            },
            {
                name: '보스_난이도',
                type: 'STRING',
                description: '보스 정보를 검색할 보스의 난이도',
                choices: Object.keys(difficultyList).map((v) => ({ name: v, value: v }))
            }
        ]
    },
    async commandExecute(interaction) {
        const bossName = interaction.options.getString('보스_이름');
        if (!bossData[bossName]) {
            return interaction.followUp('데이터가 없는 보스입니다.');
        }
        const bossGrade = interaction.options.getString('보스_난이도');

        return interaction.followUp({ embeds: [await getBossEmbed(bossName, bossData[bossName][bossGrade] ? bossGrade : Object.keys(bossData[bossName])[0])] });
    }
};
