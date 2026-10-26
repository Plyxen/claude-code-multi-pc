// The hub's tables. Every statement is idempotent, so the hub runs them on
// startup (Node) or on the first request of each isolate (Cloudflare).
export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS members (
    name TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('lead', 'worker')),
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    last_seen TEXT,
    revoked INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL,
    assignee TEXT,
    created_by TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    scope TEXT NOT NULL DEFAULT '',
    branch TEXT NOT NULL DEFAULT '',
    pr_url TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL,
    type TEXT NOT NULL,
    actor TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    target TEXT,
    task_id INTEGER,
    text TEXT NOT NULL DEFAULT '',
    data TEXT NOT NULL DEFAULT '{}'
  )`,
  `CREATE INDEX IF NOT EXISTS events_target ON events (target, id)`,
  `CREATE INDEX IF NOT EXISTS events_task ON events (task_id, id)`,
  `CREATE INDEX IF NOT EXISTS tasks_status ON tasks (status, id)`,
]
