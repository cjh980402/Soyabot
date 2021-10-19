import { MapleUser } from '../util/maple_parsing.js';

export const usage = `${client.prefix}헤비 (닉네임)`;
export const command = ['헤비', 'ㅎㅂ', '라이트', 'ㄹㅇㅌ'];
export const description = `- 헤비...`;
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 1) {
        return message.channel.send(
            `**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`
        );
    }

    const mapleUserInfo = new MapleUser(args[0]);
    const rslt = await mapleUserInfo.homeLevel();
    if (!rslt) {
        return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }

    if (rslt[4] === '제로' || /^매일.*승리$|현지|소현|김(헤(하|비)|데렐라|소헌지)/.test(mapleUserInfo.Name)) {
        return message.channel.send(`'${mapleUserInfo.Name}'님은 뉴비 유저입니다. ${rslt[4]}조아.`);
    } else {
        return message.channel.send(`${rslt[4]}조아.\n그렇지만 '${mapleUserInfo.Name}'님은 너무 무겁습니다!`);
    }
}
export const commandData = {
    name: '헤비',
    description: '헤비...',
    options: [
        {
            name: '닉네임',
            type: 'STRING',
            description: '캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    const rslt = await mapleUserInfo.homeLevel();
    if (!rslt) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }

    if (rslt[4] === '제로' || /^매일.*승리$|현지|소현|김(헤(하|비)|데렐라|소헌지)/.test(mapleUserInfo.Name)) {
        return interaction.followUp(`'${mapleUserInfo.Name}'님은 뉴비 유저입니다. ${rslt[4]}조아.`);
    } else {
        return interaction.followUp(`${rslt[4]}조아.\n그렇지만 '${mapleUserInfo.Name}'님은 너무 무겁습니다!`);
    }
}
