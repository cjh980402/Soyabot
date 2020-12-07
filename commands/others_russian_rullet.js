module.exports = {
    usage: `${client.prefix}러시안룰렛 (탄환 수)`,
    command: ["러시안룰렛", "ㄹㅅㅇㄹㄹ", "ㄽㅇㄹㄹ"],
    description: `- 러시안룰렛 게임을 수행합니다.
- 탄환 수가 2 ~ 20 범위가 아니거나 생략된 경우 자동으로 6발이 됩니다.
- ${client.prefix}참가: 게임에 참가를 합니다.
- ${client.prefix}시작: 참가자가 2명 이상일 때 게임을 시작합니다.
- ${client.prefix}종료: 인원을 모집 중인 게임을 종료합니다.
- ${client.prefix}빵: 본인의 차례를 수행합니다.`,
    channelCool: true,
    type: ["기타"],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        else if (message.guild.memberCount < 3) {
            return message.reply("소야봇을 제외한 방의 인원이 2명 이상일 때 게임을 이용할 수 있습니다.");
        }
        const bullet = (isNaN(args[0]) || +args[0] < 2 || +args[0] > 20) ? 6 : +args[0]; // 탄환 수 지정
        const gameUser = [message.member]; // 참가자 객체 배열
        message.channel.send(`게임을 시작하셨습니다.\n${client.prefix}참가 명령어로 게임 참가가 가능합니다.\n현재 참가자 (1명): ${gameUser[0].nickname ?? gameUser[0].user.username}`)
        while (1) {
            const rslt = await message.channel.awaitMessages((msg) => {
                if (msg.content.trim() == `${client.prefix}참가` || msg.content.trim() == `${client.prefix}ㅊㄱ`) {
                    if (gameUser.includes(msg.member)) {
                        msg.channel.send("이미 참가하셨습니다.");
                        return false;
                    }
                    else {
                        gameUser.push(msg.member); // 참가자 리스트에 추가
                        msg.channel.send(`게임에 참가하셨습니다.\n현재 참가자 (${gameUser.length}명): ${gameUser.map(v => v.nickname ?? v.user.username).join(", ")}`)
                        return true;
                    }
                }
                else if (msg.content.trim() == `${client.prefix}시작` || msg.content.trim() == `${client.prefix}ㅅㅈ`) {
                    if (gameUser.includes(msg.member) && gameUser.length > 1) {
                        msg.channel.send("러시안룰렛을 시작합니다.");
                        return true;
                    }
                    else if (gameUser.includes(msg.member)) {
                        msg.channel.send("최소 2명 이상의 참가자가 있어야 시작할 수 있습니다.");
                        return false;
                    }
                    else {
                        msg.channel.send("게임에 참가한 사람만 시작할 수 있습니다.");
                        return false;
                    }
                }
                else if (msg.content.trim() == `${client.prefix}종료` || msg.content.trim() == `${client.prefix}ㅈㄹ`) {
                    if (gameUser.includes(msg.member)) {
                        msg.channel.send("게임을 종료합니다.");
                        return true;
                    }
                    else {
                        msg.channel.send("게임에 참여한 사람만 종료할 수 있습니다.");
                        return false;
                    }
                }
                else { // 러시안룰렛과 관련이 없는 채팅인 경우
                    return false;
                }
            }, { max: 1, time: 300000, errors: ["time"] }); // 5분 대기
            if (gameUser.length == bullet) {
                message.channel.send("인원이 가득 차 게임이 자동으로 시작됩니다.");
                break; // 게임 시작
            }
            else if (rslt.first().content.trim() == `${client.prefix}시작` || rslt.first().content.trim() == `${client.prefix}ㅅㅈ`) {
                break; // 게임 시작
            }
            else if (rslt.first().content.trim() == `${client.prefix}종료` || rslt.first().content.trim() == `${client.prefix}ㅈㄹ`) {
                return; // 게임 종료
            }
        }
        // 게임을 진행할 때는 멘션으로 해당하는 사람에게 알려준다.
        message.channel.send(`탄환 ${bullet}발이 장전되었습니다. 첫 시작은 ${gameUser[0]}님입니다.\n${client.prefix}빵 명령어로 방아쇠를 당겨주세요.`);
        const die = Math.floor(Math.random() * bullet); // 0번째 ~ (bullet - 1)번째 탄환 중에서 선택
        for (let i = 0; i < bullet; i++) {
            try {
                await message.channel.awaitMessages((msg) => (msg.member == gameUser[i % gameUser.length] && (msg.content == `${client.prefix}빵` || msg.content == `${client.prefix}ㅃ`)), { max: 1, time: 60000, errors: ["time"] });
            }
            catch (e) { } // 시간 초과돼도 에러 throw 안하게 catch를 해줌
            if (i == die) {
                await message.channel.send(`:gun: ${gameUser[i % gameUser.length]}님이 사망하셨습니다......\n한 판 더 하실?`);
                break; // 게임 종료
            }
            else {
                await message.channel.send(`:gun: 철컥 (${bullet - (i + 1)}발 남음)`);
                await message.channel.send(`다음 차례는 ${gameUser[(i + 1) % gameUser.length]}님입니다.`);
            }
        }
    }
};