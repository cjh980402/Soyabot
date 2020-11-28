const Sejong = require('sejong');
const { matchString } = require("../util/soyabot_const.json");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); // 비동기 sleep 함수
}

module.exports = {
    usage: `${client.prefix}타자대결`,
    command: ["타자대결", "ㅌㅈㄷㄱ"],
    description: "- 임의의 문장을 빨리 치는 사람이 승리하는 타자 대결을 수행합니다.",
    channelCool: true,
    type: ["기타"],
    async execute(message) {
        const choice = matchString[Math.floor(Math.random() * matchString.length)];
        const choiceLength = Sejong.decompose(choice, { decomposeAssembledVowel: true }).length;
        for (let i = 3; i > 0; i--) {
            message.channel.send(i);
            await sleep(1000); // 3초 카운트 다운 로직
        }
        message.channel.send(`대결할 문장: ${choice.split("").join("\u200b")}\n\n위 문장으로 대결을 수행합니다.`);
        
        const start = Date.now()
        const response = await message.channel.awaitMessages((message) => (message.content == choice), { max: 1, time: 20000, errors: ["time"] });
        const time = (Date.now() - start) / 1000;
        return message.channel.send(`${response.first().author}님이 승리하였습니다!
소요시간: ${time.toFixed(2)}초\n분당타수: ${(choiceLength * 60 / time).toFixed(2)}타`);
    }
};