import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { sendPageMessage } from '../util/soyabot_util.js';

function getHelpEmbed(help, name) {
    const embeds = [];
    for (let i = 0; i < help.length; i += 10) {
        const info = help.slice(i, i + 10).join('\n');
        const embed = new EmbedBuilder()
            .setTitle(`**${name} 도움말**`)
            .setColor('#FF9999')
            .setDescription(`명령어 목록\n\n${info}`)
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const type = ['메이플', '음악', '기타'];
export const commandData = {
    name: 'help',
    description:
        '카테고리(메이플, 음악, 기타)나 명령어 이름을 입력하면 해당하는 명령어의 도움말을, 생략 시 모든 명령어의 도움말을 출력합니다.',
    options: [
        {
            name: '세부항목',
            type: ApplicationCommandOptionType.String,
            description: '도움말을 출력할 카테고리나 명령어'
        }
    ]
};
export async function commandExecute(interaction) {
    const detail = interaction.options.getString('세부항목');
    if (detail && !type.includes(detail)) {
        const target = interaction.client.commands.find((cmd) => cmd.command.includes(detail));
        if (target) {
            return interaction.followUp(`**/${target.commandData.name}**\n- ${target.commandData.description}`);
        } else {
            return interaction.followUp('지원하지 않는 도움말입니다.');
        }
    }

    const descriptions = interaction.client.commands
        .filter((cmd) => !detail || cmd.type.includes(detail))
        .map((cmd) => `**/${cmd.commandData.name}**\n- ${cmd.commandData.description}`);

    const embeds = getHelpEmbed(descriptions, interaction.client.user.username);
    await sendPageMessage(interaction, embeds);
}
