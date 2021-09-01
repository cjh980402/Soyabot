import { MessageEmbed } from '../util/discord.js-extend.js';
import { MapleUser } from '../util/maple_parsing.js';

export const usage = `${client.prefix}코디 (닉네임)`;
export const command = ['코디', 'ㅋㄷ'];
export const description = '- 해당 캐릭터가 착용한 코디템과 헤어, 성형을 출력합니다.';
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 1) {
        return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
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

    const coordi = mapleUserInfo.Coordi();
    if (!coordi) {
        return message.channel.send(`[${mapleUserInfo.Name}]\n코디 정보가 없습니다.`);
    } else {
        const coordiEmbed = new MessageEmbed()
            .setTitle(`**${mapleUserInfo.Name}님의 코디**`)
            .setColor('#FF9999')
            .setURL(mapleUserInfo.GGURL)
            .setImage(mapleUserInfo.userImg())
            .addField('**헤어**', coordi[1], true)
            .addField('**성형**', coordi[2], true)
            .addField('**모자**', coordi[0], true)
            .addField('**상의**', coordi[3], true)
            .addField('**하의**', coordi[4], true)
            .addField('**신발**', coordi[5], true)
            .addField('**무기**', coordi[6], true);

        return message.channel.send({ embeds: [coordiEmbed] });
    }
}
export const commandData = {
    name: '코디',
    description: '해당 캐릭터가 착용한 코디템과 헤어, 성형을 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: 'STRING',
            description: '코디 정보를 출력할 캐릭터의 닉네임',
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

    const coordi = mapleUserInfo.Coordi();
    if (!coordi) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n코디 정보가 없습니다.`);
    } else {
        const coordiEmbed = new MessageEmbed()
            .setTitle(`**${mapleUserInfo.Name}님의 코디**`)
            .setColor('#FF9999')
            .setURL(mapleUserInfo.GGURL)
            .setImage(mapleUserInfo.userImg())
            .addField('**헤어**', coordi[1], true)
            .addField('**성형**', coordi[2], true)
            .addField('**모자**', coordi[0], true)
            .addField('**상의**', coordi[3], true)
            .addField('**하의**', coordi[4], true)
            .addField('**신발**', coordi[5], true)
            .addField('**무기**', coordi[6], true);

        return interaction.followUp({ embeds: [coordiEmbed] });
    }
}
