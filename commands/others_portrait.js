const { MessageAttachment } = require('../util/discord.js-extend');
const { /*ADMIN_ID, */ BOT_SERVER_DOMAIN } = require('../soyabot_config.json');
const fetch = require('node-fetch');
const { getMessageImage } = require('../util/soyabot_util');
// const { cmd } = require('../admin/admin_function');

module.exports = {
    usage: `${client.prefix}그림`,
    command: ['그림', 'ㄱㄹ'],
    // description: '- 사진을 흑백 스케치화 해줍니다.',
    type: ['기타'],
    async messageExecute(message) {
        const imageURL = await getMessageImage(message);
        if (!imageURL) {
            return message.channel.send('사진이 포함된 메시지에 명령어를 사용해주세요.');
        } else {
            /*const { stdout: portraitPic } = await cmd(`python3 ./util/gl2face_portrait.py ${imageURL}`, { encoding: 'buffer' }); // 파이썬 스크립트 실행
            const image = new MessageAttachment(portraitPic, 'portrait.png');*/

            const image = new MessageAttachment(await (await fetch(`http://${BOT_SERVER_DOMAIN}/portrait/${encodeURIComponent(imageURL)}`)).buffer(), 'portrait.png');
            return message.channel.send({ files: [image] });
        }
    }
};
