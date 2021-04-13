const sqlite3 = require('sqlite3').verbose();
const { inspect } = require('util');

class SQLiteHandler {
    // sqlite3을 프로미스화 한 클래스
    constructor(db) {
        this.db = new sqlite3.Database(db);
    }

    get raw() {
        return this.db;
    }

    get tableList() {
        return this.all("SELECT name, sql FROM sqlite_master WHERE type='table'");
    }

    async allString(sql, params = []) {
        const rows = await this.all(sql, params);
        return inspect(rows);
    }

    toString() {
        return Object.getOwnPropertyNames(SQLiteHandler.prototype).join('\n');
    }

    insert(table, obj) {
        const k = Object.keys(obj);
        const v = Object.values(obj);
        const stmt = `INSERT INTO ${table} (${k.join(',')}) VALUES (?${',?'.repeat(k.length - 1)})`;
        console.log(stmt);
        return this.run(stmt, v);
    }

    replace(table, obj) {
        const k = Object.keys(obj);
        const v = Object.values(obj);
        const stmt = `REPLACE INTO ${table} (${k.join(',')}) VALUES (?${',?'.repeat(k.length - 1)})`;
        console.log(stmt);
        return this.run(stmt, v);
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                // db 멤버의 값을 받아야 하는 콜백이므로 function 사용
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastId: this.lastId, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = SQLiteHandler;
