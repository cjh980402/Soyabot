const { MessageEmbed } = require('../util/discord.js-extend');
const Sejong = require('sejong');

module.exports = {
    usage: `${client.prefix}채팅량 (닉네임)`,
    command: ['채팅량', 'ㅊㅌㄹ'],
    description: '- 해당하는 닉네임의 채팅 통계를 보여줍니다. 닉네임을 생략 시에는 본인의 채팅 통계를 보여줍니다.',
    channelCool: true,
    type: ['기타'],
    async execute(message, args) {
        if (!message.guild) {
            return message.channel.send('사용이 불가능한 채널입니다.');
        }

        let targetInfo;
        if (args.length == 0) {
            targetInfo = message.member;
        } else if (message.mentions.users.size > 0) {
            targetInfo = message.guild.member(message.mentions.users.first());
        } else {
            const targetNick = message.content.substr(message.content.indexOf(args[0])).trim();
            targetInfo = message.guild.members.cache.filter((v) => (v.nickname ?? v.user.username).includes(targetNick));
            if (targetInfo.size == 0) {
                return message.channel.send('채팅방에 존재하지 않는 사람입니다.');
            } else if (targetInfo.size == 1) {
                targetInfo = targetInfo.first();
            } else {
                const userlistEmbed = new MessageEmbed()
                    .setTitle(`**${Sejong.addJosa(targetNick, '을')} 포함한 닉네임**`)
                    .setDescription(targetInfo.array().map((v, i) => `${i + 1}. ${v.nickname ?? v.user.username}`))
                    .setColor('#FF9899')
                    .setTimestamp();
                message.channel.send(userlistEmbed);

                const rslt = await message.channel.awaitMessages((msg) => msg.author.id == message.author.id && !isNaN(msg.content) && 1 <= +msg.content && +msg.content <= targetInfo.size, { max: 1, time: 20000, errors: ['time'] });
                targetInfo = targetInfo.array()[+rslt.first().content - 1];
            }
        }

        const messagestat = await db.get(`SELECT * FROM messagedb WHERE channelsenderid = ?`, [`${message.guild.id} ${targetInfo.user.id}`]);
        if (messagestat) {
            return message.channel.send(`[${targetInfo.nickname ?? targetInfo.user.username}]
채팅 건수: ${messagestat.messagecnt.toLocaleString()}
문자 개수: ${messagestat.lettercnt.toLocaleString()}
채팅 지수: ${(messagestat.lettercnt / messagestat.messagecnt).toFixed(2)}`);
        } else {
            return message.channel.send(`[${targetInfo.nickname ?? targetInfo.user.username}]\n채팅 건수: 0\n문자 개수: 0\n채팅 지수: 0.00`);
        }
    }
};
