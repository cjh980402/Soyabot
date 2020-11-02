const fetch = require('node-fetch');

async function farm_monster(name) { // 몬스터 이름
    const params = new URLSearchParams();
    params.append("monster", name);
    const response = await fetch("http://wachan.me/farm_monster.php", {
        method: 'POST',
        body: params
    });
    return await response.text(); // 결과값이 "false"면 DB에 없는 몬스터
}

async function farm_sex(name) { // 몬스터 조합식
    name = await farm_monster(name);
    if (name == "false") {
        return '데이터에 없는 몬스터거나 올바르지 않은 몬스터입니다.';
    }
    const params = new URLSearchParams();
    params.append("monster", name);
    const response = await fetch("http://wachan.me/farm_sex.php", {
        method: 'POST',
        body: params
    });
    const data = await response.json();
    if (data.error) { // 오류 발생
        return data.error;
    }
    else {
        let rslt = "";
        data.forEach(v => {
            if (v.type == "child") { // 결과가 name인 경우
                rslt += `${v.child}(${v.c_grade}) : ${v.c_effect}${v.c_effect_value == "+0" ? "" : ` ${v.c_effect_value}`}\n`;
                rslt += `↳${v.mom} (${v.m_species} ${v.m_grade})\n`;
                rslt += `↳${v.dad} (${v.d_species} ${v.d_grade})\n\n`;
            }
            else if (v.type == "parents") { // name이 재료인 경우
                rslt += `↱${v.mom} (${v.m_species} ${v.m_grade})\n`;
                rslt += `↱${v.dad} (${v.d_species} ${v.d_grade})\n`;
                rslt += `${v.child}(${v.c_grade}) : ${v.c_effect}${v.c_effect_value == "+0" ? "" : ` ${v.c_effect_value}`}\n\n`;
            }
        });
        return rslt.trimEnd();
    }
}

async function farm_add(name, user, end_date) { // 농장 추가
    if (end_date) { // 날짜 설정
        const date = end_date.match(/^(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/);
        // 올바른 YYMMDD 형식인지 확인하는 정규식 -> 인덱스 1: 연도, 2: 월, 3: 일
        if (!date)
            return '잘못된 형식의 날짜를 입력하였습니다. YYMMDD 형식으로 끝나는 날짜를 입력해주세요.';
        const monlife = new Date(+date[1] + 2000, +date[2] - 1, +date[3] + 1); // 하루 유예기간 설정
        if (monlife < Date.now())
            return '수명이 지난 몬스터는 추가할 수 없습니다.';
        end_date = `20${date[1]}-${date[2]}-${date[3]}`; // YYYY-MM-DD 형태로 변환
    }
    else {// 무한 유지
        end_date = "";
    }
    name = await farm_monster(name);
    if (name == "false") {
        return '데이터에 없는 몬스터거나 올바르지 않은 몬스터입니다.';
    }
    const params = new URLSearchParams();
    params.append("monster", name);
    params.append("user", user);
    params.append("end_date", end_date);
    const response = await fetch("http://wachan.me/farm_info_adding.php", {
        method: 'POST',
        body: params
    });
    const data = await response.json();
    if (data.error != false) { // 오류 발생
        return data.error;
    }
    else {
        return `${data.monster} 보유 농장 목록에 ${data.user} 농장을 추가하였습니다.\n기간은 ${data.end_date == "" ? "무한" : `${data.end_date}까지`}입니다.`;
    }
}

async function farm_read(name) { // 농장 목록
    name = await farm_monster(name);
    if (name == "false") {
        return '데이터에 없는 몬스터거나 올바르지 않은 몬스터입니다.';
    }
    const params = new URLSearchParams();
    params.append("monster", name);
    const response = await fetch("http://wachan.me/farm_read.php", {
        method: 'POST',
        body: params
    });
    const data = await response.json();
    if (data.error != false) {// 오류 발생
        return data.error;
    }
    else {
        let rslt = `${name} 보유 농장 목록\n\n`;
        data.farm_list.forEach(v => {
            if (v[0] != "" && v[1] != "")
                rslt += `${v[0]} : ${v[1]}\n`
        });
        return rslt.trimEnd();
    }
}

module.exports = {
    usage: `${client.prefix}농장 ...`,
    command: ["농장", "ㄴㅈ", "ㄵ"],
    description: `- 몬스터라이프 관련 기능을 수행합니다.
- ${client.prefix}농장 목록 (몬스터 이름)
- ${client.prefix}농장 조합식 (몬스터 이름)
- ${client.prefix}농장 추가 (몬스터 이름) (농장 이름) (끝나는 날짜)
- 참고 1. 몬스터 이름은 띄어쓰기 없이 입력해야합니다.
- 참고 2. 농장 추가의 경우 무한유지를 하는 몬스터는 끝나는 날짜를 비워야합니다.
- 참고 3. 끝나는 날짜의 형식은 YYMMDD 형식입니다.`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length < 2) {
            return message.channel.send(`${this.usage}\n- 대체 명령어 : ${this.command.join(', ')}\n${this.description}`);
        }

        if (args[0] == "목록" || args[0] == "ㅁㄹ") {
            return message.channel.sendFullText(await farm_read(args[1]));
        }
        else if (args[0] == "조합식" || args[0] == "ㅈㅎㅅ") {
            message.channel.send(await farm_sex(args[1]));
        }
        else if (args[0] == "추가" || args[0] == "ㅊㄱ") {
            if (args.length < 3)
                return message.channel.send(`${this.usage}\n- 대체 명령어 : ${this.command.join(', ')}\n${this.description}`);
            return message.channel.send(await farm_add(args[1], args[2], args[3]));
        }
        else {
            return message.channel.send(`${this.usage}\n- 대체 명령어 : ${this.command.join(', ')}\n${this.description}`);
        }
    }
};