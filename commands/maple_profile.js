import { cmd } from '../admin/admin_function.js';
import { MessageAttachment } from '../util/discord.js-extend.js';
import { MapleUser } from '../util/maple_parsing.js';

export const usage = `${client.prefix}프로필 (닉네임)`;
export const command = ['프로필', 'ㅍㄹㅍ', 'ㅍㄿ'];
export const description = '- 캐릭터의 메이플 gg 프로필을 출력합니다.';
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 1) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    const mapleUserInfo = new MapleUser(args[0]);
    const level = await mapleUserInfo.homeLevel();
    if (!level) {
        return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
        if (!(await mapleUserInfo.updateGG())) {
            message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
        }
    }

    const rank = mapleUserInfo.Rank();
    const rankString = rank[2] === '-위' ? ' ' : `월드 ${rank[2]} (전체 ${rank[3]})`;
    const murung = mapleUserInfo.Murung();
    const union = mapleUserInfo.Union();
    const seed = mapleUserInfo.Seed();

    const { stdout: profilePic } = await cmd(
        `python3 ./util/maple_gg_profile.py ${mapleUserInfo.userImg(false)} ${
            mapleUserInfo.Name
        } ${mapleUserInfo.serverName()} ${level[0]} '${
            level[4]
        }' ${mapleUserInfo.serverImg()} ${level[2].toLocaleString()} '${level[3] || '(없음)'}' '${rankString}' '${
            murung ? murung[1] : '기록없음'
        }' '${murung ? murung[2] : ' '}' '${union ? union[3] : '기록없음'}' '${
            union ? `Lv.${union[0].toLocaleString()}` : ' '
        }' '${seed ? seed[1] : '기록없음'}' '${seed ? seed[2] : ' '}'`,
        { encoding: 'buffer' }
    );
    const image = new MessageAttachment(profilePic, 'profile.png');
    return message.channel.send({ content: `${mapleUserInfo.Name}님의 프로필`, files: [image] });
}
export const commandData = {
    name: '프로필',
    description: '캐릭터의 메이플 gg 프로필을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: 'STRING',
            description: '프로필을 출력할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    const level = await mapleUserInfo.homeLevel();
    if (!level) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        await interaction.editReply('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
        if (!(await mapleUserInfo.updateGG())) {
            await interaction.editReply('제한시간 내에 갱신 작업을 실패하였습니다.');
        }
    }

    const rank = mapleUserInfo.Rank();
    const rankString = rank[2] === '-위' ? ' ' : `월드 ${rank[2]} (전체 ${rank[3]})`;
    const murung = mapleUserInfo.Murung();
    const union = mapleUserInfo.Union();
    const seed = mapleUserInfo.Seed();

    const { stdout: profilePic } = await cmd(
        `python3 ./util/maple_gg_profile.py ${mapleUserInfo.userImg(false)} ${
            mapleUserInfo.Name
        } ${mapleUserInfo.serverName()} ${level[0]} '${
            level[4]
        }' ${mapleUserInfo.serverImg()} ${level[2].toLocaleString()} '${level[3] || '(없음)'}' '${rankString}' '${
            murung ? murung[1] : '기록없음'
        }' '${murung ? murung[2] : ' '}' '${union ? union[3] : '기록없음'}' '${
            union ? `Lv.${union[0].toLocaleString()}` : ' '
        }' '${seed ? seed[1] : '기록없음'}' '${seed ? seed[2] : ' '}'`,
        { encoding: 'buffer' }
    );
    const image = new MessageAttachment(profilePic, 'profile.png');
    return interaction.followUp({ content: `${mapleUserInfo.Name}님의 프로필`, files: [image] });
}
