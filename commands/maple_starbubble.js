const { kimsobotPic } = require('../util/kimsobot_config.json');
const { AttachmentTemplate } = require("../util/node-kakao-extend");
const { Button, FeedContent, MessageInfo, MessageTemplate, Profile, Thumbnail, MessageType } = require('custom-kaling');

module.exports = {
    usage: `${client.prefix}스타버블`,
    command: ["스타버블", "ㅅㅌㅂㅂ"],
    description: '- 엔젤릭버스터의 2번째 노래',
    type: ["메이플"],
    async execute(message) {
        return client.commands.find((cmd) => cmd.command.includes("play")).execute(message, ["https://youtu.be/ixww1OHztbs"]);
    }
};