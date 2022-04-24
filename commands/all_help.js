import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { PREFIX } from '../soyabot_config.js';
import { sendPageMessage } from '../util/soyabot_util.js';

function getHelpEmbed(help, name) {
    const embeds = [];
    for (let i = 0; i < help.length; i += 7) {
        const info = help.slice(i, i + 7).join('\n');
        const embed = new EmbedBuilder()
            .setTitle(`**${name} 도움말**`)
            .setColor('#FF9999')
            .setDescription(`모든 명령어 목록\n\n${info}`)
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const usage = `${PREFIX}help (카테고리│명령어 이름)`;
export const command = ['help', 'h', '도움말', '명령어', 'ㄷㅇㅁ', 'ㅁㄹㅇ'];
export const description = `- 카테고리나 명령어 이름을 입력하면 해당하는 명령어의 도움말을 출력합니다.
카테고리는 메이플, 음악, 기타가 있으며 카테고리나 명령어 이름을 생략 시 모든 명령어의 도움말을 출력합니다.`;
export const type = ['메이플', '음악', '기타'];
export async function messageExecute(message, args) {
    if (args[0] && !type.includes(args[0])) {
        const target = message.client.commands.find((cmd) => cmd.command.includes(args[0]));
        if (target) {
            return message.channel.send(
                `**${target.usage}**\n- 대체 명령어: ${target.command.join(', ')}\n${target.description}`
            );
        } else {
            return message.channel.send('지원하지 않는 도움말입니다.');
        }
    }

    const description = message.client.commands
        .filter((cmd) => cmd.description && (cmd.type.includes(args[0]) || !args[0]))
        .map((cmd) => `**${cmd.usage}**\n- 대체 명령어: ${cmd.command.join(', ')}\n${cmd.description}`);

    const embeds = getHelpEmbed(description, message.client.user.username);
    await sendPageMessage(message, embeds);
}
export const commandData = {
    name: 'help',
    description:
        '카테고리(메이플, 음악, 기타)나 명령어 이름을 입력하면 해당하는 명령어의 도움말을, 생략 시 모든 명령어의 도움말을 출력합니다.',
    options: [
        {
            name: '세부항목',
            type: ApplicationCommandOptionType.String,
            description: '도움말을 출력할 카테고리나 명령어 대상'
        }
    ]
};
export async function commandExecute(interaction) {
    const detail = interaction.options.getString('세부항목');
    if (detail && !type.includes(detail)) {
        const target = interaction.client.commands.find((cmd) => cmd.command.includes(detail));
        if (target) {
            return interaction.followUp(
                `**${target.usage}**\n- 대체 명령어: ${target.command.join(', ')}\n${target.description}`
            );
        } else {
            return interaction.followUp('지원하지 않는 도움말입니다.');
        }
    }

    const description = interaction.client.commands
        .filter((cmd) => cmd.description && (cmd.type.includes(detail) || !detail))
        .map((cmd) => `**${cmd.usage}**\n- 대체 명령어: ${cmd.command.join(', ')}\n${cmd.description}`);

    const embeds = getHelpEmbed(description, interaction.client.user.username);
    await sendPageMessage(interaction, embeds);
}
