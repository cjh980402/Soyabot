import Database from 'better-sqlite3';

export class SQLiteHandler {
    #db;

    constructor(dbPath) {
        this.#db = new Database(dbPath);
    }

    get tableList() {
        return this.all("SELECT name, sql FROM sqlite_master WHERE type = 'table'");
    }

    insert(table, data) {
        const keys = Object.keys(data);
        return this.run(
            `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_) => '?').join(', ')})`,
            Object.values(data)
        );
    }

    replace(table, data) {
        const keys = Object.keys(data);
        return this.run(
            `REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_) => '?').join(', ')})`,
            Object.values(data)
        );
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
