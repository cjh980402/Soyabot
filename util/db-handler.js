const sqlite3 = require('sqlite3').verbose();
const { inspect } = require('util');

class SQLiteHandler {
    constructor(db) {
        this.db = new sqlite3.Database(db);
    }

    get raw() {
        return this.db;
    }

    insert(table, obj) {
        return new Promise((resolve, reject) => {
            const k = Object.keys(obj);
            const v = Object.values(obj);
            const stmt = `insert into ${table} (${k.join(",")}) values (${"?" + ",?".repeat(k.length - 1)})`;
            console.log(stmt);
            this.db.run(stmt, v, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.lastId);
                }
            })
        })
    }

    replace(table, obj) {
        return new Promise((resolve, reject) => {
            const k = Object.keys(obj);
            const v = Object.values(obj);
            const stmt = `replace into ${table} (${k.join(",")}) values (${"?" + ",?".repeat(k.length - 1)})`
            console.log(stmt);
            this.db.run(stmt, v, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(null);
                }
            })
        })
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ lastId: this.lastId, changes: this.changes });
                }
            })
        })
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            })
        })
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            })
        })
    }

    allString(sql, params = []) {
        return this.all(sql, params).then(rows => inspect(rows));
    }

    get tableList() {
        return new Promise((resolve, reject) => {
            this.db.all("select name, sql from sqlite_master where type='table'", (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            })
        })
    }

    toString() {
        return Object.getOwnPropertyNames(SQLiteHandler.prototype).join("\n");
    }
}
module.exports = SQLiteHandler;
