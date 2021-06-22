const { canModifyQueue } = require('../util/soyabot_util');

module.exports = {
    usage: `${client.prefix}skipto (대기열 번호)`,
    command: ['skipto', 'st'],
    description: '- 번호로 선택한 대기열의 노래로 건너뜁니다.',
    type: ['음악'],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }
        if (args.length < 1 || isNaN(args[0])) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const queue = client.queues.get(message.guild.id);
        if (queue?.connection.state.status !== 'ready') {
            return message.reply('재생 중인 노래가 없습니다.');
        }
        if (!canModifyQueue(message.member)) {
            return message.reply(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }
        if (queue.songs.length < 2) {
            return message.reply('현재 대기열에서 건너뛸 수 있는 노래가 없습니다.');
        }

        const skipto = Math.trunc(args[0]);
        if (skipto < 2 || skipto > queue.songs.length) {
            return message.reply(`현재 대기열에서 2 ~ ${queue.songs.length}번째 노래로 건너뛸 수 있습니다.`);
        }

        queue.playing = true;
        if (queue.loop) {
            for (let i = 0; i < skipto - 2; i++) {
                queue.songs.push(queue.songs.shift());
            }
        } else {
            queue.songs = queue.songs.slice(skipto - 2);
        }
        queue.audioPlayer.stop(true);
        return message.channel.send(`${message.author} ⏭ ${skipto - 1}개의 노래를 건너뛰었습니다.`);
    }
};
