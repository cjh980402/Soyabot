const util = require('util');
const cp = require('child_process');
const exec = util.promisify(cp.exec);

module.exports = {
    name: "데굴데굴",
    aliases: ["ㄷㄱㄷㄱ"],
    description: "추억의 메이플스토리 주사위 굴리기",
    type: ["메이플"],
    async execute(message) {
        await exec(`python3 ./util/maple_stats_drawer.py "${message.author.username.replace(/"/g, '\\"')}" ${message.author.id}`);
        const dice = await message.channel.send(`${message.author.username}님의 스탯`, {
            files: [`./pictures/dice_result/${message.author.id}.png`]
        });
        await dice.react("🔁");

        const filter = (reaction, user) => user.id === message.author.id; // 처음 명령어 쓴 사람과 이모티콘 누른사람이 같은지 체크
        const collector = dice.createReactionCollector(filter, {
            time: 60000 // 1분
        });
        collector.on("collect", async (reaction, user) => {
            switch (reaction.emoji.name) {
                case "🔁":
                    if (message.guild)
                        reaction.users.remove(user).catch(console.error);
                    await this.execute(message);
                    collector.stop();
                    break;

                default:
                    if (message.guild)
                        reaction.users.remove(user).catch(console.error);
                    break;
            }
        });
    }
};
