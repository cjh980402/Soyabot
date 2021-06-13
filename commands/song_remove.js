const { canModifyQueue } = require('../util/soyabot_util');

module.exports = {
    usage: `${client.prefix}remove (대기열 번호)`,
    command: ['remove', 'rm'],
    description: '- 대기열에서 지정한 노래를 삭제합니다. (,로 구분하여 여러 노래 삭제 가능)',
    type: ['음악'],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 그룹톡 여부 체크
        }
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const queue = client.queues.get(message.guild.id);
        if (!queue?.connection.dispatcher) {
            return message.reply('재생 중인 노래가 없습니다.');
        }
        if (!canModifyQueue(message.member)) {
            return message.reply(`같은 음성 채널에 참가해주세요! (${client.user})`);
        }
        if (queue.songs.length < 2) {
            return message.reply('현재 대기열에서 삭제할 수 있는 노래가 없습니다.');
        }

        const songRemove = args.join('').split(',').map((str) => +str.trim());
        const removed = [];
        if (songRemove.every((v) => !isNaN(v) && 2 <= v && v <= queue.songs.length)) {
            queue.songs = queue.songs.filter((v, i) => {
                if (songRemove.includes(i + 1)) {
                    removed.push(v);
                    return false;
                } else {
                    return true;
                }
            });
        } else {
            return message.reply(`현재 대기열에서 2 ~ ${queue.songs.length}번째 노래를 삭제할 수 있습니다.`);
        }

        return message.channel.send(`❌ ${message.author}가 대기열에서 **${removed.map((song, i) => `${songRemove[i]}. ${song.title}`)}**을 삭제했습니다.`);
    }
};
