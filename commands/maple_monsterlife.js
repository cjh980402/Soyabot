const fetch = require('node-fetch');

async function farm_monster(monster) {
    // 몬스터 이름
    const params = new URLSearchParams();
    params.append('monster', monster);
    const response = await fetch('http://wachan.me/farm_monster.php', {
        method: 'POST',
        body: params
    });
    return response.text(); // 결과값이 "false"면 DB에 없는 몬스터
}

async function farm_sex(monster) {
    // 몬스터 조합식
    monster = await farm_monster(monster);
    if (monster === 'false') {
        return '데이터에 없는 몬스터거나 올바르지 않은 몬스터입니다.';
    }
    const params = new URLSearchParams();
    params.append('monster', monster);
    const response = await fetch('http://wachan.me/farm_sex.php', {
        method: 'POST',
        body: params
    });
    const data = await response.json();
    if (data.error) {
        // 오류 발생
        return data.error;
    } else {
        return data
            .map((v) => {
                if (v.type === 'child') {
                    // 결과가 monster인 경우
                    return `${v.child}(${v.c_grade}): ${v.c_effect}${v.c_effect_value === '+0' ? '' : ` ${v.c_effect_value}`}\n↳${v.mom} (${v.m_species} ${v.m_grade})\n↳${v.dad} (${v.d_species} ${
                        v.d_grade
                    })`;
                } else if (v.type === 'parents') {
                    // monster가 재료인 경우
                    return `↱${v.mom} (${v.m_species} ${v.m_grade})\n↱${v.dad} (${v.d_species} ${v.d_grade})\n${v.child}(${v.c_grade}): ${v.c_effect}${
                        v.c_effect_value === '+0' ? '' : ` ${v.c_effect_value}`
                    }`;
                }
            })
            .join('\n\n');
    }
}

async function farm_add(end_date, user, monster) {
    // 농장 추가
    if (end_date === '무한유지') {
        end_date = ''; // 무한유지의 경우 빈 값을 넘겨야함
    } else {
        // 날짜 설정
        const date = end_date.match(/^(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/);
        // 올바른 YYMMDD 형식인지 확인하는 정규식 → 인덱스 1: 연도, 2: 월, 3: 일
        if (!date) {
            return '잘못된 형식의 날짜를 입력하였습니다. YYMMDD 형식으로 끝나는 날짜를 입력해주세요.';
        }
        const monlife = new Date(+date[1] + 2000, +date[2] - 1, +date[3] + 1); // 하루 유예기간 설정
        if (monlife < Date.now()) {
            return '수명이 지난 몬스터는 추가할 수 없습니다.';
        }
        end_date = `20${date[1]}-${date[2]}-${date[3]}`; // YYYY-MM-DD 형태로 변환
    }
    if (!/^[가-힣]{2,6}$/.test(user)) {
        return '올바르지 않은 농장 이름입니다. 농장 이름은 2 ~ 6글자의 한글이어야 합니다.';
    }
    monster = await farm_monster(monster);
    if (monster === 'false') {
        return '데이터에 없는 몬스터거나 올바르지 않은 몬스터입니다.';
    }
    const params = new URLSearchParams();
    params.append('monster', monster);
    params.append('user', user);
    params.append('end_date', end_date);
    const response = await fetch('http://wachan.me/farm_info_adding.php', {
        method: 'POST',
        body: params
    });
    const data = await response.json();
    if (data.error !== false) {
        // 오류 발생
        return data.error;
    } else {
        return `${data.monster} 보유 농장 목록에 ${data.user} 농장을 추가하였습니다.\n기간은 ${data.end_date ? `${data.end_date}까지` : '무한'}입니다.`;
    }
}

async function farm_read(monster) {
    // 농장 목록
    monster = await farm_monster(monster);
    if (monster === 'false') {
        return '데이터에 없는 몬스터거나 올바르지 않은 몬스터입니다.';
    }
    const params = new URLSearchParams();
    params.append('monster', monster);
    const response = await fetch('http://wachan.me/farm_read2.php', {
        method: 'POST',
        body: params
    });
    const data = await response.json();
    if (data.error !== false) {
        // 오류 발생
        return data.error;
    } else {
        let rslt = `${monster} 보유 농장 목록\n\n`;
        if (data.farm_list.length) {
            rslt += `${data.farm_list.map((v) => `${v[1] ?? '무한유지'}: ${v[0]} (👍: ${+v[3]}, 👎: ${+v[4]})`).join('\n')}`; // 좋아요, 싫어요 값이 0일 때 null로 들어옴
        } else {
            rslt += '등록된 농장 정보가 없습니다.';
        }
        return rslt;
    }
}

async function farm_info(user) {
    // 농장 정보
    if (!/^[가-힣]{2,6}$/.test(user)) {
        return '올바르지 않은 농장 이름입니다. 농장 이름은 2 ~ 6글자의 한글이어야 합니다.';
    }
    const params = new URLSearchParams();
    params.append('farm', user);
    const response = await fetch('http://wachan.me/farm_read_from_name.php', {
        method: 'POST',
        body: params
    });
    const data = await response.json();
    if (data.error !== false) {
        // 오류 발생
        return data.error;
    } else {
        let rslt = `${user} 농장의 정보\n\n`;
        if (data.monster_list.length) {
            rslt += `${data.monster_list.map((v) => `${v[1] ?? '무한유지'}: ${v[0]} (👍: ${+v[3]}, 👎: ${+v[4]})`).join('\n')}`; // 좋아요, 싫어요 값이 0일 때 null로 들어옴
        } else {
            rslt += '등록된 몬스터 정보가 없습니다.';
        }
        return rslt;
    }
}

module.exports = {
    usage: `${client.prefix}농장 ...`,
    command: ['농장', 'ㄴㅈ', 'ㄵ'],
    description: `- 몬스터라이프 관련 기능을 수행합니다.
- ${client.prefix}농장 목록 (몬스터 이름)
- ${client.prefix}농장 조합식 (몬스터 이름)
- ${client.prefix}농장 정보 (농장 이름)
- ${client.prefix}농장 추가 (끝나는 날짜) (농장 이름) (몬스터 이름)
- 참고. 끝나는 날짜의 형식은 YYMMDD 형식입니다. (무한유지를 하는 몬스터는 "무한유지")`,
    type: ['메이플'],
    async messageExecute(message, args) {
        if (args.length < 2) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        if (args[0] === '목록' || args[0] === 'ㅁㄹ') {
            return message.channel.sendSplitCode(await farm_read(args.slice(1).join('')), { split: { char: '\n' } });
        } else if (args[0] === '조합식' || args[0] === 'ㅈㅎㅅ') {
            return message.channel.send(await farm_sex(args.slice(1).join('')));
        } else if (args[0] === '정보' || args[0] === 'ㅈㅂ') {
            return message.channel.sendSplitCode(await farm_info(args.slice(1).join('')), { split: { char: '\n' } });
        } else if (args[0] === '추가' || args[0] === 'ㅊㄱ') {
            if (args.length < 4) {
                return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
            }
            return message.channel.send(await farm_add(args[1], args[2], args.slice(3).join('')));
        } else {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
    },
    interaction: {
        name: '농장',
        description: '몬스터라이프 관련 기능을 수행합니다.',
        options: [
            {
                name: '목록',
                type: 'SUB_COMMAND',
                description: '입력한 몬스터의 농장 목록을 보여줍니다.',
                options: [
                    {
                        name: '몬스터_이름',
                        type: 'STRING',
                        description: '농장 목록을 검색할 몬스터의 이름',
                        required: true
                    }
                ]
            },
            {
                name: '조합식',
                type: 'SUB_COMMAND',
                description: '입력한 몬스터가 포함되는 조합식을 보여줍니다.',
                options: [
                    {
                        name: '몬스터_이름',
                        type: 'STRING',
                        description: '조합식을 검색할 몬스터의 이름',
                        required: true
                    }
                ]
            },
            {
                name: '정보',
                type: 'SUB_COMMAND',
                description: '입력한 농장의 몬스터 목록을 보여줍니다.',
                options: [
                    {
                        name: '농장_이름',
                        type: 'STRING',
                        description: '몬스터 목록을 검색할 농장의 이름',
                        required: true
                    }
                ]
            },
            {
                name: '추가',
                type: 'SUB_COMMAND',
                description: '농장 데이터에 몬스터를 추가합니다.',
                options: [
                    {
                        name: '끝나는_날짜',
                        type: 'STRING',
                        description: '몬스터의 기한이 끝나는 날짜(YYMMDD 형식, 무한유지를 하는 몬스터는 "무한유지")',
                        required: true
                    },
                    {
                        name: '농장_이름',
                        type: 'STRING',
                        description: '몬스터가 있는 농장의 이름',
                        required: true
                    },
                    {
                        name: '몬스터_이름',
                        type: 'STRING',
                        description: '추가할 몬스터의 이름',
                        required: true
                    }
                ]
            }
        ]
    },
    async commandExecute(interaction) {
        const subcommnd = interaction.options.getSubcommand();

        if (subcommnd === '목록') {
            return interaction.sendSplitCode(await farm_read(interaction.options.getString('몬스터_이름')), { split: { char: '\n' } });
        } else if (subcommnd === '조합식') {
            return interaction.followUp(await farm_sex(interaction.options.getString('몬스터_이름')));
        } else if (subcommnd === '정보') {
            return interaction.sendSplitCode(await farm_info(interaction.options.getString('농장_이름')), { split: { char: '\n' } });
        } else if (subcommnd === '추가') {
            return interaction.followUp(await farm_add(interaction.options.getString('끝나는_날짜'), interaction.options.getString('농장_이름'), interaction.options.getString('몬스터_이름')));
        }
    }
};
