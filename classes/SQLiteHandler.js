import Database from 'better-sqlite3';

export class SQLiteHandler {
    #db;

    constructor(dbPath) {
        this.#db = new Database(dbPath);
    }

    get tableList() {
        return this.all("SELECT name, sql FROM sqlite_master WHERE type='table'");
    }

    insert(table, data) {
        const k = Object.keys(data);
        const v = Object.values(data);
        const sql = `INSERT INTO ${table} (${k.join(', ')}) VALUES (${[...'?'.repeat(v.length)].join(', ')})`;
        return this.run(sql, v);
    }

    replace(table, data) {
        const k = Object.keys(data);
        const v = Object.values(data);
        const sql = `REPLACE INTO ${table} (${k.join(', ')}) VALUES (${[...'?'.repeat(v.length)].join(', ')})`;
        return this.run(sql, v);
    }

    run(sql, ...params) {
        return this.#db.prepare(sql).run(...params);
    }

    get(sql, ...params) {
        return this.#db.prepare(sql).get(...params);
    }

    all(sql, ...params) {
        return this.#db.prepare(sql).all(...params);
    }
}
