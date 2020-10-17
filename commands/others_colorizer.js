const { DEEP_API_KEY } = require("../config.json");
const deepai = require('deepai');
deepai.setApiKey(DEEP_API_KEY);

module.exports = {
    usage: `${client.prefix}채색`,
    command: ["채색", "ㅊㅅ"],
    description: "- 원하는 흑백 사진과 함께 명령어를 사용하면 사진을 채색한 결과를 보여줍니다.",
    type: ["기타"],
    async execute(message) {
        if (message.attachments.array().length == 0 || !message.attachments.array()[0].height) {
            message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        }
        else {
            const resp = await deepai.callStandardApi("colorizer", {
                image: message.attachments.array()[0].url,
            });
            message.channel.send({
                files: [resp.output_url]
            });
        }
    }
};