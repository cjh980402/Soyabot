const gameRegExp = [
    new RegExp(`^${client.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(참가|ㅊㄱ)$`),
    new RegExp(`^${client.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(시작|ㅅㅈ)$`),
    new RegExp(`^${client.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(종료|ㅈㄹ)$`),
    new RegExp(`^${client.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(빵|ㅃ)$`)
];

export const usage = `${client.prefix}러시안룰렛 (탄환 수)`;
export const command = ['러시안룰렛', 'ㄹㅅㅇㄹㄹ', 'ㄽㅇㄹㄹ'];
export const description = `- 러시안룰렛 게임을 수행합니다.
- 탄환 수가 2 ~ 20 범위가 아니거나 생략된 경우 자동으로 6발이 됩니다.
- ${client.prefix}참가: 게임에 참가를 합니다.
- ${client.prefix}시작: 참가자가 2명 이상일 때 게임을 시작합니다.
- ${client.prefix}종료: 인원을 모집 중인 게임을 종료합니다.
- ${client.prefix}빵: 본인의 차례를 수행합니다.`;
export const channelCool = true;
export const type = ['기타'];
export async function messageExecute(message, args) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    } else if (message.guild.memberCount < 3) {
        return message.reply(`${client.user.username}을 제외한 방의 인원이 2명 이상일 때 게임을 이용할 수 있습니다.`);
    }
    const count = Math.trunc(args[0]);
    const bullet = isNaN(count) || count < 2 || count > 20 ? 6 : count; // 탄환 수 지정
    const gameUser = [message.member]; // 참가자 객체 배열
    message.channel.send(`게임을 시작하셨습니다.\n${client.prefix}참가 명령어로 게임 참가가 가능합니다.\n현재 참가자 (1명): ${gameUser[0].nickname ?? gameUser[0].user.username}`);
    for (let gameChatType = 0; ; ) {
        await message.channel.awaitMessages({
            filter: (msg) => {
                const trimContent = msg.content.trim();
                if (gameRegExp[0].test(trimContent)) {
                    if (gameUser.some((v) => msg.member.id === v.id)) {
                        msg.channel.send('이미 참가하셨습니다.');
                        return false;
                    } else {
                        gameChatType = 1;
                        gameUser.push(msg.member); // 참가자 리스트에 추가
                        msg.channel.send(`게임에 참가하셨습니다.\n현재 참가자 (${gameUser.length}명): ${gameUser.map((v) => v.nickname ?? v.user.username).join(', ')}`);
                        return true;
                    }
                } else if (gameRegExp[1].test(trimContent)) {
                    if (gameUser.some((v) => msg.member.id === v.id)) {
                        if (gameUser.length > 1) {
                            gameChatType = 2;
                            msg.channel.send('러시안룰렛을 시작합니다.');
                            return true;
                        } else {
                            msg.channel.send('2명 이상의 참가자가 있어야 시작할 수 있습니다.');
                            return false;
                        }
                    } else {
                        msg.channel.send('게임에 참가한 사람만 시작할 수 있습니다.');
                        return false;
                    }
                } else if (gameRegExp[2].test(trimContent)) {
                    if (gameUser.some((v) => msg.member.id === v.id)) {
                        gameChatType = 3;
                        msg.channel.send('게임을 종료합니다.');
                        return true;
                    } else {
                        msg.channel.send('게임에 참여한 사람만 종료할 수 있습니다.');
                        return false;
                    }
                } else {
                    // 러시안룰렛과 관련이 없는 채팅인 경우
                    return false;
                }
            },
            max: 1,
            time: 300000,
            errors: ['time']
        }); // 5분 대기
        if (gameChatType === 1 && gameUser.length === bullet) {
            await message.channel.send('인원이 가득 차 게임이 자동으로 시작됩니다.');
            break; // 게임 시작
        } else if (gameChatType === 2) {
            break; // 게임 시작
        } else if (gameChatType === 3) {
            return; // 게임 종료
        }
    }
    // 게임을 진행할 때는 멘션으로 해당하는 사람에게 알려준다.
    await message.channel.send(`탄환 ${bullet}발이 장전되었습니다. 첫 시작은 ${gameUser[0]}님입니다.\n${client.prefix}빵 명령어로 방아쇠를 당겨주세요.`);
    const die = Math.floor(Math.random() * bullet); // 0번째 ~ (bullet - 1)번째 탄환 중에서 선택
    for (let i = 0; i < bullet; i++) {
        try {
            await message.channel.awaitMessages({
                filter: (msg) => msg.member.id === gameUser[i % gameUser.length].id && gameRegExp[3].test(msg.content.trim()),
                max: 1,
                time: 60000,
                errors: ['time']
            });
        } catch {} // 시간 초과돼도 에러 throw 안하게 catch를 해줌
        if (i === die) {
            try {
                const dieUser = await message.guild.members.fetch({ user: gameUser[i % gameUser.length].id, cache: false });
                return message.channel.send(`🔫 ${dieUser}님이 사망하셨습니다......\n한 판 더 하실?`);
            } catch {
                return message.channel.send('사망한 유저가 방에서 나가서 게임이 자동으로 종료됩니다.');
            }
        } else {
            try {
                const nextUser = await message.guild.members.fetch({ user: gameUser[(i + 1) % gameUser.length].id, cache: false });
                await message.channel.send(`🔫 철컥 (${bullet - (i + 1)}발 남음)`);
                await message.channel.send(`다음 차례는 ${nextUser}님입니다.`);
            } catch {
                return message.channel.send('다음 차례 유저가 방에서 나가서 게임이 자동으로 종료됩니다.');
            }
        }
    }
}
export const commandData = {
    name: '러시안룰렛',
    description: '러시안룰렛 게임을 수행합니다. 탄환 수가 2 ~ 20 범위가 아니거나 생략된 경우 자동으로 6발이 됩니다.',
    options: [
        {
            name: '탄환_수',
            type: 'INTEGER',
            description: '러시안룰렛 게임의 탄환 수',
            choices: [...Array(19)].map((_, i) => ({ name: i + 2, value: i + 2 }))
        }
    ]
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    } else if (interaction.guild.memberCount < 3) {
        return interaction.followUp(`${client.user.username}을 제외한 방의 인원이 2명 이상일 때 게임을 이용할 수 있습니다.`);
    }
    const bullet = interaction.options.getInteger('탄환_수') ?? 6; // 탄환 수 지정
    const gameUser = [interaction.member]; // 참가자 객체 배열
    await interaction.editReply(`게임을 시작하셨습니다.\n${client.prefix}참가 명령어로 게임 참가가 가능합니다.\n현재 참가자 (1명): ${gameUser[0].nickname ?? gameUser[0].user.username}`);
    for (let gameChatType = 0; ; ) {
        await interaction.channel.awaitMessages({
            filter: (msg) => {
                const trimContent = msg.content.trim();
                if (gameRegExp[0].test(trimContent)) {
                    if (gameUser.some((v) => msg.member.id === v.id)) {
                        msg.channel.send('이미 참가하셨습니다.');
                        return false;
                    } else {
                        gameChatType = 1;
                        gameUser.push(msg.member); // 참가자 리스트에 추가
                        msg.channel.send(`게임에 참가하셨습니다.\n현재 참가자 (${gameUser.length}명): ${gameUser.map((v) => v.nickname ?? v.user.username).join(', ')}`);
                        return true;
                    }
                } else if (gameRegExp[1].test(trimContent)) {
                    if (gameUser.some((v) => msg.member.id === v.id)) {
                        if (gameUser.length > 1) {
                            gameChatType = 2;
                            msg.channel.send('러시안룰렛을 시작합니다.');
                            return true;
                        } else {
                            msg.channel.send('2명 이상의 참가자가 있어야 시작할 수 있습니다.');
                            return false;
                        }
                    } else {
                        msg.channel.send('게임에 참가한 사람만 시작할 수 있습니다.');
                        return false;
                    }
                } else if (gameRegExp[2].test(trimContent)) {
                    if (gameUser.some((v) => msg.member.id === v.id)) {
                        gameChatType = 3;
                        msg.channel.send('게임을 종료합니다.');
                        return true;
                    } else {
                        msg.channel.send('게임에 참여한 사람만 종료할 수 있습니다.');
                        return false;
                    }
                } else {
                    // 러시안룰렛과 관련이 없는 채팅인 경우
                    return false;
                }
            },
            max: 1,
            time: 300000,
            errors: ['time']
        }); // 5분 대기
        if (gameChatType === 1 && gameUser.length === bullet) {
            await interaction.channel.send('인원이 가득 차 게임이 자동으로 시작됩니다.');
            break; // 게임 시작
        } else if (gameChatType === 2) {
            break; // 게임 시작
        } else if (gameChatType === 3) {
            return; // 게임 종료
        }
    }
    // 게임을 진행할 때는 멘션으로 해당하는 사람에게 알려준다.
    await interaction.followUp(`탄환 ${bullet}발이 장전되었습니다. 첫 시작은 ${gameUser[0]}님입니다.\n${client.prefix}빵 명령어로 방아쇠를 당겨주세요.`);
    const die = Math.floor(Math.random() * bullet); // 0번째 ~ (bullet - 1)번째 탄환 중에서 선택
    for (let i = 0; i < bullet; i++) {
        try {
            await interaction.channel.awaitMessages({
                filter: (msg) => msg.member.id === gameUser[i % gameUser.length].id && gameRegExp[3].test(msg.content.trim()),
                max: 1,
                time: 60000,
                errors: ['time']
            });
        } catch {} // 시간 초과돼도 에러 throw 안하게 catch를 해줌
        if (i === die) {
            try {
                const dieUser = await interaction.guild.members.fetch({ user: gameUser[i % gameUser.length].id, cache: false });
                return interaction.channel.send(`🔫 ${dieUser}님이 사망하셨습니다......\n한 판 더 하실?`);
            } catch {
                return interaction.channel.send('사망한 유저가 방에서 나가서 게임이 자동으로 종료됩니다.');
            }
        } else {
            try {
                const nextUser = await interaction.guild.members.fetch({ user: gameUser[(i + 1) % gameUser.length].id, cache: false });
                await interaction.channel.send(`🔫 철컥 (${bullet - (i + 1)}발 남음)`);
                await interaction.channel.send(`다음 차례는 ${nextUser}님입니다.`);
            } catch {
                return interaction.channel.send('다음 차례 유저가 방에서 나가서 게임이 자동으로 종료됩니다.');
            }
        }
    }
}
