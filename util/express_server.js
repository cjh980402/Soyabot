const { exists, readFile } = require('./async_to_promis.js');
const express = require('express');
const app = express();

app.get('/image/stock/:name', async (req, res) => {
    console.log(req.params.name); // :name에 해당하는 부분
    if (await exists(`./pictures/stock/${req.params.name}`)) {
        res.end(await readFile(`./pictures/stock/${req.params.name}`));
    }
    else {
        res.end('Image is not exists.');
    }
});

app.get('/image/hosting/:name', async (req, res) => {
    console.log(req.params.name); // :name에 해당하는 부분
    if (await exists(`./pictures/hosting/${req.params.name}`)) {
        res.end(await readFile(`./pictures/hosting/${req.params.name}`));
    }
    else {
        res.end('Image is not exists.');
    }
});

app.get('/:name', async (req, res) => {
    console.log(req.params.name); // :name에 해당하는 부분
    if (await exists('./htmls/default.html')) {
        res.end(await readFile('./htmls/default.html'));
    }
});

app.listen(8170, () => {
    console.log("8170번 port에 http server를 띄웠습니다.");
});

module.exports = app;