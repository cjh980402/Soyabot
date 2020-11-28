const { DEEP_API_KEY } = require("../soyabot_config.json");
const deepai = require('deepai');
deepai.setApiKey(DEEP_API_KEY);

module.exports = {
    usage: `${client.prefix}만화`,
    command: ["만화", "ㅁㅎ"],
    description: "- 원하는 인물 사진과 함께 명령어를 사용하면 대상을 만화캐릭터처럼 변경합니다.",
    type: ["기타"],
    async execute(message) {
        if (message.attachments.array().length == 0 || !message.attachments.array()[0].height) {
            message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        }
        else {
            try {
                const resp = await deepai.callStandardApi("toonify", {
                    image: message.attachments.array()[0].url,
                });
                message.channel.send({
                    files: [resp.output_url]
                });
            }
            catch (e) {
                if (e.response.status == 400) {
                    message.channel.send('사진에서 적절한 대상 인물을 찾지 못했습니다.');
                }
                else {
                    throw e;
                }
            }
        }
    }
};