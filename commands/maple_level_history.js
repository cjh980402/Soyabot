import { MapleUser } from '../util/maple_parsing.js';

export const usage = `${client.prefix}히스토리 (닉네임)`;
export const command = ['히스토리', 'ㅎㅅㅌㄹ', '레벨히스토리', 'ㄹㅂㅎㅅㅌㄹ', 'ㄼㅎㅅㅌㄹ'];
export const description = '- 캐릭터의 레벨업 내역을 보여줍니다.';
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 1) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
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

    const data = mapleUserInfo.LevelHistory();
    if (!data) {
        return message.channel.send(`[${mapleUserInfo.Name}]\n레벨 히스토리를 가져오지 못했습니다.`);
    } else {
        const len = data[0].length;
        let rslt = `[${mapleUserInfo.Name}]`;
        for (let i = 1; i < len; i++) {
            rslt += `\nLv.${data[1][i]} 달성일: ${data[0][i]}`;
        }
        return message.channel.send(rslt);
    }
}
export const commandData = {
    name: '히스토리',
    description: '캐릭터의 레벨업 내역을 보여줍니다.',
    options: [
        {
            name: '닉네임',
            type: 'STRING',
            description: '레벨업 내역을 검색할 캐릭터의 닉네임',
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

    const data = mapleUserInfo.LevelHistory();
    if (!data) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n레벨 히스토리를 가져오지 못했습니다.`);
    } else {
        const len = data[0].length;
        let rslt = `[${mapleUserInfo.Name}]`;
        for (let i = 1; i < len; i++) {
            rslt += `\nLv.${data[1][i]} 달성일: ${data[0][i]}`;
        }
        return interaction.followUp(rslt);
    }
}
