import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync, type StatementSync } from "node:sqlite";

type SqlValue = null | number | bigint | string | NodeJS.ArrayBufferView;
type Row = Record<string, unknown>;

function metadata(changes = 0) {
  return {
    changed_db: changes > 0,
    changes,
    duration: 0,
    last_row_id: 0,
    rows_read: 0,
    rows_written: changes,
    size_after: 0,
  };
}

class TestPreparedStatement {
  private parameters: SqlValue[] = [];

  constructor(
    private readonly statement: StatementSync,
    readonly sql: string,
  ) {}

  bind(...values: SqlValue[]) {
    this.parameters = values;
    return this;
  }

  async first<T = Row>(column?: string): Promise<T | null> {
    const row = this.statement.get(...this.parameters) as Row | undefined;
    if (!row) return null;
    return (column ? row[column] : row) as T;
  }

  async all<T = Row>() {
    const results = this.statement.all(...this.parameters) as T[];
    return {
      success: true,
      results,
      meta: metadata(),
    };
  }

  async raw<T = unknown[]>(options?: { columnNames?: boolean }) {
    const rows = this.statement.all(...this.parameters) as Row[];
    const columns = this.statement.columns().map((column) => column.name);
    const values = rows.map((row) => columns.map((column) => row[column]));
    return (options?.columnNames ? [columns, ...values] : values) as T[];
  }

  async run() {
    const result = this.statement.run(...this.parameters);
    return {
      success: true,
      results: [],
      meta: {
        ...metadata(Number(result.changes)),
        last_row_id: Number(result.lastInsertRowid),
      },
    };
  }
}

class TestD1Database {
  constructor(private readonly database: DatabaseSync) {}

  prepare(sql: string) {
    return new TestPreparedStatement(this.database.prepare(sql), sql);
  }

  async batch<T = Row>(statements: TestPreparedStatement[]) {
    this.database.exec("BEGIN");
    try {
      const results = [];
      for (const statement of statements) {
        if (/^\s*(?:SELECT|WITH|PRAGMA)\b/i.test(statement.sql)) {
          results.push(await statement.all<T>());
        } else {
          results.push(await statement.run());
        }
      }
      this.database.exec("COMMIT");
      return results;
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }

  async exec(sql: string) {
    this.database.exec(sql);
    return { count: 1, duration: 0 };
  }

  async dump() {
    return new ArrayBuffer(0);
  }
}

export function createTestDatabase(projectRoot: string) {
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON");

  const migrationsDirectory = join(projectRoot, "migrations");
  const migrations = readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const migration of migrations) {
    database.exec(readFileSync(join(migrationsDirectory, migration), "utf8"));
  }

  return {
    database,
    d1: new TestD1Database(database) as unknown as D1Database,
    close: () => database.close(),
  };
}

export function seedUser(
  database: DatabaseSync,
  {
    id,
    name,
    email,
  }: {
    id: string;
    name: string;
    email: string;
  },
) {
  database
    .prepare(
      `INSERT INTO "user" (
         id, name, email, emailVerified, createdAt, updatedAt
       ) VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`,
    )
    .run(id, name, email);
}
