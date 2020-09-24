const fs = require("fs");
const config = require("../config.json");

module.exports = {
    usage: `${client.prefix}pruning`,
    command: ["pruning"],
    description: "- 봇 메시지 자동정리 상태를 전환",
    type: ["음악"],
    execute(message) {
        config.PRUNING = !config.PRUNING;

        fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => {
            if (err) {
                console.log(err);
                return message.channel.send("파일 작성 중 에러가 발생했습니다.").catch(console.error);
            }

            return message.channel
                .send(`현재 메시지 자동정리 상태 : ${config.PRUNING ? "**켜짐**" : "**꺼짐**"}`)
                .catch(console.error);
        });
    }
};
