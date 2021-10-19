import { MapleUser } from '../util/maple_parsing.js';

export const usage = `${client.prefix}업적 (닉네임)`;
export const command = ['업적', 'ㅇㅈ'];
export const description = '- 캐릭터의 업적 등급, 점수, 랭킹을 출력합니다.';
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 1) {
        return message.channel.send(
            `**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`
        );
    }

    const mapleUserInfo = new MapleUser(args[0]);
    if (!(await mapleUserInfo.homeLevel())) {
        return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
        if (!(await mapleUserInfo.updateGG())) {
            message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
        }
    }

    const rslt = mapleUserInfo.Achieve();
    if (!rslt) {
        return message.channel.send(`[${mapleUserInfo.Name}]\n기록이 없습니다.`);
    } else {
        return message.channel.send(
            `[${mapleUserInfo.Name}]\n등급: ${rslt[0]}\n업적점수: ${rslt[1]}\n월드랭킹: ${rslt[2]}\n전체랭킹: ${rslt[3]}`
        );
    }
}
export const commandData = {
    name: '업적',
    description: '캐릭터의 업적 등급, 점수, 랭킹을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: 'STRING',
            description: '업적 정보를 검색할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    if (!(await mapleUserInfo.homeLevel())) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        await interaction.editReply('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
        if (!(await mapleUserInfo.updateGG())) {
            await interaction.editReply('제한시간 내에 갱신 작업을 실패하였습니다.');
        }
    }

    const rslt = mapleUserInfo.Achieve();
    if (!rslt) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n기록이 없습니다.`);
    } else {
        return interaction.followUp(
            `[${mapleUserInfo.Name}]\n등급: ${rslt[0]}\n업적점수: ${rslt[1]}\n월드랭킹: ${rslt[2]}\n전체랭킹: ${rslt[3]}`
        );
    }
}
