import { PREFIX } from '../soyabot_config.js';
const noticematch = {
    공지: 'notice',
    업데이트: 'update',
    우르스: 'urus',
    테섭공지: 'test',
    테섭파일: 'testpatch'
};

export const usage = `${PREFIX}자동알림 (카테고리)`;
export const command = ['자동알림', 'ㅈㄷㅇㄹ'];
export const description = `- 입력한 카테고리(${Object.keys(noticematch).join(
    ', '
)})에 따른 자동알림 기능 상태를 전환합니다.
카테고리 생략 시 현재 알림상태를 알려줍니다.`;
export const type = ['메이플'];
export async function messageExecute(message) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }
    return message.reply('현재 봇 프로필에 있는 공지 채널에서만 자동알림을 받을 수 있습니다.');
}
export const commandData = {
    name: '자동알림',
    description: `입력한 카테고리(${Object.keys(noticematch).join(
        ', '
    )})에 따른 자동알림 기능 상태를 전환합니다. 카테고리 생략 시 현재 알림상태를 알려줍니다.`,
    options: [
        {
            name: '카테고리',
            type: 'STRING',
            description: '자동알림 상태를 변경할 카테고리',
            choices: Object.keys(noticematch).map((v) => ({ name: v, value: v }))
        }
    ]
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }
    return interaction.followUp('현재 봇 프로필에 있는 공지 채널에서만 자동알림을 받을 수 있습니다.');
}
