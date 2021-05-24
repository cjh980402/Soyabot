const { cmd } = require('../admin/admin_function');

module.exports = {
    usage: `${client.prefix}데굴데굴`,
    command: ['데굴데굴', 'ㄷㄱㄷㄱ'],
    description: '- 추억의 메이플스토리 주사위!',
    type: ['메이플'],
    async execute(message) {
        const nickname = message.member?.nickname ?? message.author.username;
        await cmd(`python3 ./util/maple_stats_drawer.py '${nickname.replace(/'/g, '$&"$&"$&')}'`);
        // 파이썬 스크립트 실행, 쉘에서 작은 따옴표로 감싸서 쉘 특수문자 이스케이핑, 닉네임의 작은 따옴표는 별도로 이스케이핑
        const dice = await message.channel.send(`${nickname}님의 스탯`, { files: ['./pictures/dice_result.png'] });
        await dice.react('🔁');

        const filter = (reaction, user) => reaction.emoji.name == '🔁' && message.author.id == user.id;
        const collector = dice.createReactionCollector(filter, { time: 60000 });

        collector.once('collect', () => {
            collector.stop();
            if (!dice.deleted) {
                dice.delete({ timeout: 1000 });
            }
            this.execute(message);
        });
    }
};
