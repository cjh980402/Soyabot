module.exports = {
    usage: `${client.prefix}놀장강`,
    command: ["놀장강", "ㄴㅈㄱ", "ㄵㄱ"],
    description: "- 일반 장비의 놀장강 강화 능력치를 출력합니다.",
    type: ["메이플"],
    async execute(message) {
        return message.channel.send('놀장강 강화 능력치 표', {
            files: ['./pictures/noljang.png']
        });
    }
};