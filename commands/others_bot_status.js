const OS = require('os');
const { cmd } = require('../admin/admin_function');

function timeKoreanUnit(num) {
    // 시간 값에 한글 단위를 붙이는 함수
    const unit = [
        ['일', 86400],
        ['시간', 3600],
        ['분', 60],
        ['초', 1]
    ];
    const rslt = [];
    for (let i = 0; i < unit.length; num %= unit[i][1], i++) {
        const quotient = Math.floor(num / unit[i][1]);
        if (quotient > 0) {
            rslt.push(`${quotient}${unit[i][0]}`);
        }
    }
    return rslt.join(' ') || '0초';
}

module.exports = {
    usage: `${client.prefix}상태`,
    command: ['상태', 'ㅅㅌ'],
    description: '소야봇의 작동 상태를 알려줍니다.',
    type: ['기타'],
    async execute(message) {
        let memory;
        if (process.platform === 'linux') {
            const memorycmd = (await cmd('free', true)).split(/\s+/);
            memory = 100 - Math.round((memorycmd[13] / memorycmd[8]) * 100);
        } else {
            memory = 100 - Math.round((OS.freemem() / OS.totalmem()) * 100);
        }

        return message.channel.send(`작동 시간: ${timeKoreanUnit(Math.floor(client.uptime / 1000))}\n메모리 사용량: ${memory}%`);
    }
};
