const Database = require('better-sqlite3');

class SQLiteHandler {
    #db;

    constructor(db) {
        this.#db = new Database(db);
    }

    get raw() {
        return this.#db;
    }

    get tableList() {
        return this.all("SELECT name, sql FROM sqlite_master WHERE type='table'");
    }

    insert(table, obj) {
        const k = Object.keys(obj);
        const v = Object.values(obj);
        const sql = `INSERT INTO ${table} (${k.join(', ')}) VALUES (${[...'?'.repeat(v.length)].join(', ')})`;
        return this.run(sql, v);
    }

    replace(table, obj) {
        const k = Object.keys(obj);
        const v = Object.values(obj);
        const sql = `REPLACE INTO ${table} (${k.join(', ')}) VALUES (${[...'?'.repeat(v.length)].join(', ')})`;
        return this.run(sql, v);
    }

    run(sql, params = []) {
        return this.#db.prepare(sql).run(...params);
    }

    get(sql, params = []) {
        return this.#db.prepare(sql).get(...params);
    }

    all(sql, params = []) {
        return this.#db.prepare(sql).all(...params);
    }
}

module.exports = SQLiteHandler;
