import { PREFIX } from '../soyabot_config.js';

export const usage = `${PREFIX}수로휴가`;
export const command = ['수로휴가', 'ㅅㄹㅎㄱ', 'ㅅㅀㄱ'];
export const description = '- 길드 지하수로 휴가 신청서를 보여줍니다.';
export const type = ['메이플'];
export async function messageExecute(message) {
    await message.channel.send({ content: '수로 휴가 신청서', files: ['./pictures/guild_vacation.png'] });
}
export const commandData = {
    name: '수로휴가',
    description: '길드 지하수로 휴가 신청서를 보여줍니다.'
};
export async function commandExecute(interaction) {
    await interaction.followUp({ content: '수로 휴가 신청서', files: ['./pictures/guild_vacation.png'] });
}
