const { DEEP_API_KEY } = require("../soyabot_config.json");
const deepai = require('deepai');
deepai.setApiKey(DEEP_API_KEY);

module.exports = {
    usage: `${client.prefix}확대`,
    command: ["확대", "ㅎㄷ"],
    description: "- 원하는 사진과 함께 명령어를 사용하면 waifu2x를 사용하여 노이즈 제거와 함께 사진을 확대합니다.",
    type: ["기타"],
    async execute(message) {
        if (message.attachments.size == 0 || !message.attachments.first().height) {
            return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        }
        else {
            const resp = await deepai.callStandardApi("waifu2x", {
                image: message.attachments.first().url,
            });
            return message.channel.send({
                files: [resp.output_url]
            });
        }
    }
};