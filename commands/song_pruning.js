const fs = require("fs");
const util = require('util');
const config = require("../config.json");
const writeFile = util.promisify(fs.writeFile);

module.exports = {
    usage: `${client.prefix}pruning`,
    command: ["pruning"],
    description: "- 봇 메시지 자동정리 상태를 전환",
    type: ["음악"],
    async execute(message) {
        config.PRUNING = !config.PRUNING;
        await writeFile("./config.json", JSON.stringify(config, null, 2));
        return message.channel.send(`현재 메시지 자동정리 상태 : ${config.PRUNING ? "**켜짐**" : "**꺼짐**"}`);
    }
};
