const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
// 각각의 ChartJSNodeCanvas는 자체 캔버스를 만드므로 메모리 관리, GC 사용을 보장하기 위해 적은 인스턴스를 생성하고 재사용해야함
const messageChart = new ChartJSNodeCanvas({
    width: 2000,
    height: 2000,
    plugins: {
        requireLegacy: ['chartjs-plugin-datalabels']
    },
    chartCallback: (ChartJS) => {
        ChartJS.defaults.global.defaultFontFamily = 'NanumBarunGothic, unifont, OpenSansEmoji';
    }
});
messageChart.registerFont('./fonts/unifont.ttf', { family: 'unifont' });
messageChart.registerFont('./fonts/OpenSansEmoji.ttf', { family: 'OpenSansEmoji' });

const coronaChart = new ChartJSNodeCanvas({
    width: 600,
    height: 600,
    plugins: {
        requireLegacy: ['chartjs-plugin-datalabels', 'chartjs-plugin-doughnutlabel']
    },
    chartCallback: (ChartJS) => {
        ChartJS.defaults.global.defaultFontFamily = 'NanumBarunGothic';
    }
});

const mesoChart = new ChartJSNodeCanvas({
    width: 1200,
    height: 975,
    plugins: {
        requireLegacy: ['chartjs-plugin-datalabels']
    },
    chartCallback: (ChartJS) => {
        ChartJS.defaults.global.defaultFontFamily = 'NanumBarunGothic';
    }
});

module.exports = {
    renderMessageChart: (configuration, height = 2000) => {
        messageChart._height = height; // 차트의 높이 변경
        return messageChart.renderToBuffer(configuration);
    },
    renderCoronaChart: (configuration) => coronaChart.renderToBuffer(configuration),
    renderMesoChart: (configuration) => mesoChart.renderToBuffer(configuration)
};
