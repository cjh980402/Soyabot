const { bossData } = require('../util/soyabot_const.json');
const { MessageEmbed } = require('../util/discord.js-extend');

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

        const bossEmbed = new MessageEmbed()
            .setTitle(`**${bossName}(${bossGrade})의 보상 / 정보**`)
            .setColor('#FF9999')
            .setDescription(`**보상**\n${bossData[bossName][bossGrade][0].join('\n\n')}\n\n**정보**\n${bossData[bossName][bossGrade][1].join('\n\n')}`);

        return message.channel.send({ embeds: [bossEmbed] });
    },
    interaction: {
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
                choices: ['하드', '카오스', '노말', '이지'].map((v) => ({ name: v, value: v }))
            }
        ]
    },
    async interactionExecute(interaction) {
        const args = interaction.options.data.map((v) => v.value);

        const bossName = args[0];
        if (!bossData[bossName]) {
            return interaction.followUp('데이터가 없는 보스입니다.');
        }
        const bossGrade = !bossData[bossName][args[1]] ? Object.keys(bossData[bossName])[0] : args[1];

        const bossEmbed = new MessageEmbed()
            .setTitle(`**${bossName}(${bossGrade})의 보상 / 정보**`)
            .setColor('#FF9999')
            .setDescription(`**보상**\n${bossData[bossName][bossGrade][0].join('\n\n')}\n\n**정보**\n${bossData[bossName][bossGrade][1].join('\n\n')}`);

        return interaction.followUp({ embeds: [bossEmbed] });
    }
};
