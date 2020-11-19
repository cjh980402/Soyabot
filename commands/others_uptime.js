module.exports = {
    usage: `${client.prefix}uptime`,
    command: ["uptime", "u"],
    description: "소야봇이 작동을 시작한 후 지난 시간을 알려줍니다.",
    type: ["기타"],
    async execute(message) {
        let seconds = Math.floor(client.uptime / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        seconds %= 60;
        minutes %= 60;
        hours %= 24;

        return message.reply(`가동된 시간: \`${days}일 ${hours}시간 ${minutes}분 ${seconds}초\``);
    }
};