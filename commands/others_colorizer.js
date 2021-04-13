const { DEEP_API_KEY } = require('../soyabot_config.json');
const deepai = require('deepai');
deepai.setApiKey(DEEP_API_KEY);

function getMessageImage(message) {
    return message?.attachments.first()?.height ? message.attachments.first().url : null;
}

module.exports = {
    usage: `${client.prefix}채색`,
    command: ['채색', 'ㅊㅅ'],
    description: '- 원하는 흑백 사진과 함께 명령어를 사용하면 사진을 채색한 결과를 보여줍니다.',
    type: ['기타'],
    async execute(message) {
        const imageURL = getMessageImage(message) ?? getMessageImage(message.channel.messages.cache.get(message.reference?.messageID));
        if (!imageURL) {
            return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        } else {
            const resp = await deepai.callStandardApi('colorizer', {
                image: imageURL
            });
            return message.channel.send({
                files: [resp.output_url]
            });
        }
    }
};
