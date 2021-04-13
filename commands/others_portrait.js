const { ADMIN_ID } = require('../soyabot_config.json');
const { cmd } = require('../admin/admin_function');

function getMessageImage(message) {
    return message?.attachments.first()?.height ? message.attachments.first().url : null;
}

module.exports = {
    usage: `${client.prefix}그림`,
    command: ['그림', 'ㄱㄹ'],
    // description: '- 사진을 흑백 스케치화 해줍니다.',
    type: ['기타'],
    async execute(message) {
        const imageURL = getMessageImage(message) ?? getMessageImage(message.channel.messages.cache.get(message.reference?.messageID));
        if (!imageURL) {
            return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        } else if (message.author.id == ADMIN_ID) {
            await cmd(`python3 ./util/gl2face_portrait.py ${imageURL}`); // 파이썬 스크립트 실행
            return message.channel.send({
                files: ['./pictures/portrait.png']
            });
        }
    }
};
