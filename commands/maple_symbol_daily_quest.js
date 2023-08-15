const odiumDate = '2022-08-25';
const odiumChangeDate = '2023-06-15';
const shangrilaDate = '2023-06-15';
const arteriaDate = '2023-07-13';
const carcionDate = '2023-08-10';

const odiumStartDate = new Date(odiumDate);
const odiumChangeStartDate = new Date(odiumChangeDate);
const shangrilaStartDate = new Date(shangrilaDate);
const arteriaStartDate = new Date(arteriaDate);
const carcionStartDate = new Date(carcionDate);

const maxSymbolLevel = 11;

function calcDate(endDate, startDate) {
    endDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
}

function getTotalSymbol(level) {
    let totalSymbol = 0;

    for (let i = 1; i < level; i++) {
        totalSymbol += 9 * i * i + 20 * i;
    }

    return totalSymbol;
}

export const type = '메이플';
export const commandData = {
    name: '일퀘',
    description: '각 지역의 출시일부터 일일퀘스트로 누적한 어센틱 심볼 레벨을 계산합니다.'
};
export async function commandExecute(interaction) {
    const today = new Date();
    const odiumDateDiff = calcDate(today, odiumStartDate);
    const shangrilaDateDiff = calcDate(today, shangrilaStartDate);
    const arteriaDateDiff = calcDate(today, arteriaStartDate);
    const carcionDateDiff = calcDate(today, carcionStartDate);

    const odiumChangeDateDiff = calcDate(today, odiumChangeStartDate);
    // 오디움 일퀘 변경 전후에 해당하는 날짜 수 계산
    const odiumBeforeChange = Math.max(0, odiumDateDiff - odiumChangeDateDiff + 1) - 1;
    const odiumAfterChange = Math.max(0, odiumChangeDateDiff) + 1;

    const symbolData = {
        오디움: { level: 1, left: 1, req: 29, questTotal: odiumBeforeChange * 5 + odiumAfterChange * 10 + 1 },
        도원경: { level: 1, left: 1, req: 29, questTotal: (shangrilaDateDiff + 1) * 10 + 1 },
        아르테리아: { level: 1, left: 1, req: 29, questTotal: (arteriaDateDiff + 1) * 10 + 1 },
        카르시온: { level: 1, left: 1, req: 29, questTotal: (carcionDateDiff + 1) * 10 + 1 }
    };

    for (let i = 1; i <= maxSymbolLevel; i++) {
        let nowTotal = getTotalSymbol(i);
        let nowReq = 9 * i * i + 20 * i;
        for (const name in symbolData) {
            if (symbolData[name].questTotal >= nowTotal) {
                symbolData[name].level = i;
                if (i < maxSymbolLevel) {
                    symbolData[name].left = symbolData[name].questTotal - nowTotal;
                    symbolData[name].req = nowReq;
                } else {
                    symbolData[name].left = 0;
                    symbolData[name].req = 0;
                }
            }
        }
    }

    let result = `[${new Date().toLocaleDateString()}]`;
    for (const name in symbolData) {
        result +=
            symbolData[name].level >= maxSymbolLevel
                ? `\n**${name}**\n성장 레벨: ${symbolData[name].level}, 성장치: MAX`
                : `\n**${name}**\n성장 레벨: ${symbolData[name].level}, 성장치: ${symbolData[name].left} / ${symbolData[name].req}`;
    }

    await interaction.followUp(result);
}
