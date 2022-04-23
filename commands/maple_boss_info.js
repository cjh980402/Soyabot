import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { PREFIX } from '../soyabot_config.js';
import { bossData } from '../util/Constant.js';

const bossDifficulty = ['하드', '카오스', '노말', '이지'];

function getBossEmbed(bossName, bossGrade) {
    if (!bossData[bossName][bossGrade]) {
        bossGrade = Object.keys(bossData[bossName])[0];
    }
    const targetBoss = bossData[bossName][bossGrade];

    return new EmbedBuilder()
        .setTitle(`**${bossName}(${bossGrade})의 보상 / 정보**`)
        .setColor('#FF9999')
        .setDescription(`**보상**\n${targetBoss[0].join('\n\n')}\n\n**정보**\n${targetBoss[1].join('\n\n')}`);
}

export const usage = `${PREFIX}보스 (보스 이름) (보스 난이도)`;
export const command = ['보스', 'ㅂㅅ', 'ㅄ'];
export const description =
    '- 해당하는 보스의 보상과 체력, 방어율을 알려줍니다.\n- 난이도를 생략하면 최상위 등급의 정보를 보여줍니다.';
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length < 1) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }
    const bossGrade = args.length > 1 && bossDifficulty.includes(args.at(-1)) ? args.pop() : null;
    const bossName = args.join('');
    if (!bossData[bossName]) {
        return message.channel.send('데이터가 없는 보스입니다.');
    }

    await message.channel.send({ embeds: [getBossEmbed(bossName, bossGrade)] });
}
export const commandData = {
    name: '보스',
    description: '해당하는 보스의 보상과 체력, 방어율을 알려줍니다.',
    options: [
        {
            name: '보스_이름',
            type: ApplicationCommandOptionType.String,
            description: '보스 정보를 검색할 보스의 이름',
            required: true
        },
        {
            name: '보스_난이도',
            type: ApplicationCommandOptionType.String,
            description: '보스 정보를 검색할 보스의 난이도',
            choices: bossDifficulty.map((v) => ({ name: v, value: v }))
        }
    ]
};
export async function commandExecute(interaction) {
    const bossName = interaction.options.getString('보스_이름').replace(/\s+/g, '');
    if (!bossData[bossName]) {
        return interaction.followUp('데이터가 없는 보스입니다.');
    }
    const bossGrade = interaction.options.getString('보스_난이도');

    await interaction.followUp({ embeds: [getBossEmbed(bossName, bossGrade)] });
}
