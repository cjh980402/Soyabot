const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    usage: `${client.prefix}skipto <Queue Number>`,
    command: ["skipto", "st"],
    description: "- 번호로 선택한 대기열의 노래로 건너뜁니다.",
    type: ["음악"],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        if (!args.length || isNaN(args[0])) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const queue = client.queue.get(message.guild.id);
        if (!queue) {
            return message.channel.send("현재 대기열이 없습니다.");
        }
        if (!canModifyQueue(message.member)) {
            return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
        }

        if (+args[0] < 2 || +args[0] > queue.songs.length) {
            return message.reply(`현재 대기열에서 2 ~ ${queue.songs.length}번째 노래로 건너뛸 수 있습니다.`);
        }

        queue.playing = true;
        if (queue.loop) {
            for (let i = 0; i < args[0] - 2; i++) {
                queue.songs.push(queue.songs.shift());
            }
        }
        else {
            queue.songs = queue.songs.slice(args[0] - 2);
        }
        queue.connection.dispatcher.end();
        return queue.textChannel.send(`${message.author} ⏭ ${args[0] - 1}개의 노래를 건너뛰었습니다.`);
    }
};
