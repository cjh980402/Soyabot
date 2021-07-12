const { ADMIN_ID } = require('../soyabot_config.json');
const { writeFile } = require('fs').promises;
const { cmd } = require('../admin/admin_function');
const { spawn } = require('child_process');
let proc = null;

module.exports = {
    usage: `${client.prefix}cpp (소스코드)`,
    command: ['cpp'],
    type: ['기타'],
    async execute(message, args) {
        if (message.author.id === ADMIN_ID && args.length > 0) {
            if (proc) {
                proc.stdin.write(`${args.join(' ')}\n`);
            } else {
                const sourceCode = message.content.replace(/\s*.+?\s*.+?\s+/, '').trim();
                await writeFile(`./other_source/cpp_source.cpp`, sourceCode);
                const compile = await cmd('g++ -o ./other_source/cpp_result.out ./other_source/cpp_source.cpp', true);
                if (compile) {
                    return message.channel.send(compile); // 컴파일 에러 출력
                }
                proc = spawn('./other_source/cpp_result.out');
                proc.stderr.on('data', (data) => {
                    message.channel.send(String(data), { split: { char: '' } });
                });
                proc.stdout.on('data', (data) => {
                    message.channel.send(String(data), { split: { char: '' } });
                });
                proc.on('close', (code) => {
                    message.channel.send(`Process exited with code ${code}`);
                    proc = null;
                });
            }
        }
    }
};
