import { setTimeout } from 'node:timers/promises';
import { sendAdmin } from '../admin/bot_message.js';
import { MapleError } from '../classes/MapleParser.js';
import { commandCount } from '../util/soyabot_util.js';
const promiseTimeout = (promise, ms) => Promise.race([promise, setTimeout(ms)]);

export const name = 'interactionCreate';
export async function listener(interaction) {
    if (interaction.isChatInputCommand()) {
        try {
            await interaction.deferReply(); // deferReply를 하지 않으면 3초 내로 슬래시 커맨드 응답을 해야함
            console.log(
                `(${new Date().toLocaleString()}) ${interaction.channelId} ${interaction.channel.name ?? 'DM'} ${
                    interaction.user.id
                } ${interaction.user.username}: ${interaction}\n`
            );

            const botPermissions = [
                'ViewChannel',
                interaction.channel.isThread() ? 'SendMessagesInThreads' : 'SendMessages',
                'EmbedLinks'
            ];

            if (
                interaction.guildId &&
                (!interaction.channel.permissionsFor(interaction.guild.me).has(botPermissions) ||
                    interaction.guild.me.isCommunicationDisabled())
            ) {
                // 기본 권한이 없어서 명령을 수행하지 못하는 채널이므로 DM으로 메시지 전송
                return await interaction.user.send(
                    `봇에 적절한 권한이 부여되지 않았거나 타임아웃이 적용되어 명령을 수행할 수 없습니다.
필요한 권한 종류: ${botPermissions.join(', ')}`
                );
            }

            if (interaction.client.cooldowns.has(interaction.commandName)) {
                // 명령이 수행 중인 경우
                return await interaction.followUp(
                    `'${interaction.commandName}' 명령을 사용하기 위해 잠시 기다려야합니다.`
                );
            }

            interaction.client.cooldowns.add(interaction.commandName); // 수행 중이지 않은 명령이면 새로 추가한다
            const { commandExecute } = interaction.client.commands.get(interaction.commandName);

            commandCount(interaction.client.db, interaction.commandName);
            await promiseTimeout(commandExecute(interaction), 300000); // 명령어 수행 부분

            interaction.client.cooldowns.delete(interaction.commandName); // 명령어 수행 끝나면 쿨타임 삭제
        } catch (err) {
            interaction.client.cooldowns.delete(interaction.commandName); // 에러 발생 시 쿨타임 삭제
            try {
                if (err instanceof MapleError) {
                    await interaction.followUp(err.message);
                } else {
                    sendAdmin(
                        interaction.client.users,
                        `작성자: ${interaction.user.username}\n방 ID: ${interaction.channelId}\n채팅 내용: ${interaction}\n에러 내용: ${err.stack}`
                    );
                    await interaction.followUp('에러로그가 전송되었습니다.');
                }
            } catch {}
        }
    }
}
