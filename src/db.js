// src/db.js
import * as SQLite from 'expo-sqlite';

let db;

// open (async) once
async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('smartcity_auth.db');
  }
  return db;
}

// call this once at startup
export async function initDB() {
  const database = await getDB();
  // create table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);
}

/**
 * Minimal wrapper that mimics the old result shape for our code:
 * - SELECT -> returns { rows: { length, item(i) } }
 * - INSERT/UPDATE/DELETE -> returns { insertId, rowsAffected }
 */
export async function executeSql(sql, params = []) {
  const database = await getDB();
  const isSelect = /^\s*select/i.test(sql);

  if (isSelect) {
    const rowsArray = await database.getAllAsync(sql, params);
    return {
      rows: {
        length: rowsArray.length,
        item: (i) => rowsArray[i],
      },
    };
  } else {
    const res = await database.runAsync(sql, params);
    return {
      insertId: res.lastInsertRowId,
      rowsAffected: res.changes,
      rows: { length: 0, item: () => null },
    };
  }
}
