const OS = require('os');
const { cmd } = require('../admin/admin_function');

module.exports = {
    usage: `${client.prefix}상태`,
    command: ["상태", "ㅅㅌ"],
    description: "소야봇의 작동 상태를 알려줍니다.",
    type: ["기타"],
    async execute(message) {
        let seconds = Math.floor(client.uptime / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        seconds %= 60;
        minutes %= 60;
        hours %= 24;

        let memory;
        if (process.platform == "linux") {
            const memorycmd = (await cmd("free")).split(/\s+/);
            memory = 100 - Math.round(memorycmd[13] / memorycmd[8] * 100);
        }
        else {
            memory = 100 - Math.round(OS.freemem() / OS.totalmem() * 100);
        }

        return message.channel.send(`작동 시간: ${days}일 ${hours}시간 ${minutes}분 ${seconds}초\n메모리 사용량: ${memory}%`);
    }
};