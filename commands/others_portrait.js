const { writeFile, exec } = require('../util/async_to_promis');
const fetch = require("node-fetch");

module.exports = {
    usage: `${client.prefix}그림`,
    command: ["그림", "ㄱㄹ"],
    description: '- 사진을 흑백 스케치화 해줍니다.',
    type: ["기타"],
    async execute(message) {
        if (message.attachments.size == 0 || !message.attachments.first().height) {
            return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        }
        else {
            await writeFile("./pictures/portrait/input.png", await (await fetch(message.attachments.first().url)).buffer());
            await exec("python3 ./util/gl2face_portrait.py"); // 파이썬 스크립트 실행
            return message.channel.send({
                files: ["./pictures/portrait/output.png"]
            });
        }
    }
};