import { adminChat } from '../admin/admin_function.js';
import { sendAdmin } from '../admin/bot_message.js';
import { ADMIN_ID } from '../soyabot_config.js';

export const name = 'messageCreate';
export async function listener(message) {
    try {
        if (message.author.bot || message.author.system) {
            // 봇 또는 시스템 유저 여부 체크
            return;
        }

        const botPermissions = [
            'ViewChannel',
            message.channel.isThread() ? 'SendMessagesInThreads' : 'SendMessages',
            'ReadMessageHistory',
            'EmbedLinks',
            'AttachFiles'
        ];

        if (
            !message.guildId ||
            (message.channel.permissionsFor(message.guild.me).has(botPermissions) &&
                !message.guild.me.isCommunicationDisabled())
        ) {
            if (message.author.id === ADMIN_ID) {
                // 관리자 여부 체크
                await adminChat(message);
            }
        }
    } catch (err) {
        try {
            sendAdmin(
                message.client.users,
                `작성자: ${message.author.username}\n방 ID: ${message.channelId}\n채팅 내용: ${message}\n에러 내용: ${err.stack}`
            );
            await message.reply('에러로그가 전송되었습니다.');
        } catch {}
    }
}
