import { ApplicationCommandOptionType } from 'discord.js';
import { PREFIX } from '../soyabot_config.js';
import { canModifyQueue } from '../util/soyabot_util.js';

export const usage = `${PREFIX}move (대기열 번호) (이동할 위치)`;
export const command = ['move', 'mv'];
export const description = '- 번호로 선택한 대기열의 노래를 원하는 위치로 이동합니다.';
export const type = ['음악'];
export async function messageExecute(message, args) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }
    if (args.length !== 2 || isNaN(args[0]) || isNaN(args[1])) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    const queue = message.client.queues.get(message.guildId);
    if (!queue?.player.state.resource) {
        return message.reply('재생 중인 노래가 없습니다.');
    }
    if (!canModifyQueue(message.member)) {
        return message.reply(`${message.client.user}과 같은 음성 채널에 참가해주세요!`);
    }
    if (queue.songs.length < 2) {
        return message.reply('현재 대기열에서 이동이 가능한 노래가 없습니다.');
    }

    const target = Math.trunc(args[0]);
    if (target < 2 || target > queue.songs.length) {
        return message.reply(`현재 대기열에서 2 ~ ${queue.songs.length}번째 노래만 이동할 수 있습니다.`);
    }

    const dest = Math.trunc(args[1]);
    if (dest < 2 || dest > queue.songs.length) {
        return message.reply(`현재 대기열에서 2 ~ ${queue.songs.length}번째 위치로만 이동할 수 있습니다.`);
    }

    if (target !== dest) {
        queue.songs.splice(dest - 1, 0, queue.songs.splice(target - 1, 1)[0]);
    }
    await message.channel.send(
        `${message.author} ${target < dest ? '➡️' : '⬅️'} ${target}번째 노래를 ${dest}번째로 이동했습니다.`
    );
}
export const commandData = {
    name: 'move',
    description: '번호로 선택한 대기열의 노래를 원하는 위치로 이동합니다.',
    options: [
        {
            name: '대기열_번호',
            type: ApplicationCommandOptionType.Integer,
            description: '위치를 옮길 노래의 대기열 번호',
            required: true
        },
        {
            name: '이동할_위치',
            type: ApplicationCommandOptionType.Integer,
            description: '노래가 이동될 위치의 대기열 번호',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = interaction.client.queues.get(interaction.guildId);
    if (!queue?.player.state.resource) {
        return interaction.followUp('재생 중인 노래가 없습니다.');
    }
    if (!canModifyQueue(interaction.member)) {
        return interaction.followUp(`${interaction.client.user}과 같은 음성 채널에 참가해주세요!`);
    }
    if (queue.songs.length < 2) {
        return interaction.followUp('현재 대기열에서 이동이 가능한 노래가 없습니다.');
    }

    const target = interaction.options.getInteger('대기열_번호');
    if (target < 2 || target > queue.songs.length) {
        return interaction.followUp(`현재 대기열에서 2 ~ ${queue.songs.length}번째 노래만 이동할 수 있습니다.`);
    }

    const dest = interaction.options.getInteger('이동할_위치');
    if (dest < 2 || dest > queue.songs.length) {
        return interaction.followUp(`현재 대기열에서 2 ~ ${queue.songs.length}번째 위치로만 이동할 수 있습니다.`);
    }

    if (target !== dest) {
        queue.songs.splice(dest - 1, 0, queue.songs.splice(target - 1, 1)[0]);
    }
    await interaction.followUp(
        `${interaction.user} ${target < dest ? '➡️' : '⬅️'} ${target}번째 노래를 ${dest}번째로 이동했습니다.`
    );
}
