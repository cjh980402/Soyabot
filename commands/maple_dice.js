const { cmd } = require('../admin/admin_function');

module.exports = {
    usage: `${client.prefix}데굴데굴`,
    command: ["데굴데굴", "ㄷㄱㄷㄱ"],
    description: "- 추억의 메이플스토리 주사위!",
    type: ["메이플"],
    async execute(message) {
        const nickname = message.member?.nickname ?? message.author.username;
        await cmd(`python3 ./util/maple_stats_drawer.py "${nickname.replace(/"/g, '\\"')}"`);
        const dice = await message.channel.send(`${nickname}님의 스탯`, {
            files: ["./pictures/dice_result.png"]
        });
        await dice.react("🔁");

        const filter = (reaction, user) => ["🔁"].includes(reaction.emoji.name) && message.author.id === user.id;
        const collector = dice.createReactionCollector(filter, { time: 60000 });

        collector.on("collect", async (reaction, user) => {
            collector.stop();
            dice.delete({ timeout: 1000 });
            await this.execute(message);
        });
        return dice;
    }
};
