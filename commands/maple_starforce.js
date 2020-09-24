module.exports = {
    usage: `${client.prefix}스타포스`,
    command: ["스타포스", "ㅅㅌㅍㅅ"],
    description: "- 130 ~ 200제 일반 장비의 스타포스 누적 능력치 출력 (135제는 130제 템과 동일한 능력치)",
    type: ["메이플"],
    execute(message) {
        message.channel.send('일반 장비의 스타포스 누적 능력치 표', {
            files: ['./pictures/starforce.png']
        });
    }
};
