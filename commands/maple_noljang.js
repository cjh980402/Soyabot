module.exports = {
    usage: `${client.prefix}놀장강`,
    command: ["놀장강", "ㄴㅈㄱ", "ㄵㄱ"],
    description: "- 일반 장비의 놀장강 강화 능력치 출력",
    type: ["메이플"],
    execute(message) {
        message.channel.send('놀장강 강화 능력치 표', {
            files: ['./pictures/noljang.png']
        });
    }
};
