const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'sv_closures.db');
const legacyJsonPath = path.resolve(__dirname, 'database.json');

// Open (or create) the SQLite database file
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
  } else {
    console.log('SQLite database opened:', dbPath);
    // Enable WAL mode for better crash safety and performance
    db.run('PRAGMA journal_mode=WAL');
    db.run('PRAGMA foreign_keys=ON');
  }
});

// ---------------------------------------------------------------------------
// Compatibility wrappers — keep the same async Promise API that server.js uses
// ---------------------------------------------------------------------------

/**
 * Execute INSERT / UPDATE / DELETE statements.
 * Returns { lastID, changes } to match the original interface.
 */
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

/**
 * Execute a SELECT that returns multiple rows.
 */
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Execute a SELECT that returns a single row (or null).
 */
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
};

// ---------------------------------------------------------------------------
// Schema creation helpers
// ---------------------------------------------------------------------------
const createSchema = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          username    TEXT    NOT NULL UNIQUE,
          email       TEXT    NOT NULL UNIQUE,
          password    TEXT    NOT NULL,
          role        TEXT    NOT NULL DEFAULT 'System Operator',
          created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
          updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        )
      `, (err) => { if (err) return reject(err); });

      db.run(`
        CREATE TABLE IF NOT EXISTS product_specification_technical_dra (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          Maintains       TEXT    NOT NULL UNIQUE,
          database        TEXT    NOT NULL,
          closure         TEXT    NOT NULL,
          product         TEXT    NOT NULL,
          specifications  TEXT    NOT NULL,
          status          TEXT    NOT NULL DEFAULT 'Active',
          created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
          updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
        )
      `, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

// ---------------------------------------------------------------------------
// Database initialisation — migrates from legacy database.json if needed
// ---------------------------------------------------------------------------
const initDatabase = async () => {
  // 1. Create tables
  await createSchema();
  console.log('SQLite schema ready.');

  // ── Seed Users ────────────────────────────────────────────────────────────
  const userRow = await dbGet('SELECT COUNT(*) as count FROM users');
  if (userRow.count === 0) {
    console.log('Seeding users table...');

    let legacyUsers = [];
    if (fs.existsSync(legacyJsonPath)) {
      try {
        const legacy = JSON.parse(fs.readFileSync(legacyJsonPath, 'utf8'));
        legacyUsers = legacy.tables?.users || [];
      } catch (_) { /* ignore */ }
    }

    if (legacyUsers.length > 0) {
      for (const u of legacyUsers) {
        await dbRun(
          `INSERT OR IGNORE INTO users (username, email, password, role, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            u.username,
            u.email || `${u.username}@svclosures.com`,
            u.password,
            u.role || 'System Operator',
            u.created_at || new Date().toISOString(),
            u.updated_at || new Date().toISOString()
          ]
        );
      }
      console.log(`Migrated ${legacyUsers.length} user(s) from database.json`);
    } else {
      // Default admin account
      await dbRun(
        `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        ['admin', 'admin@svclosures.com', 'supervisor', 'Quality Manager']
      );
      console.log('Seeded default admin user.');
    }
  }

  // ── Seed Products ─────────────────────────────────────────────────────────
  const specRow = await dbGet(
    'SELECT COUNT(*) as count FROM product_specification_technical_dra'
  );
  if (specRow.count === 0) {
    console.log('Seeding product specifications table...');

    let legacySpecs = [];
    if (fs.existsSync(legacyJsonPath)) {
      try {
        const legacy = JSON.parse(fs.readFileSync(legacyJsonPath, 'utf8'));
        legacySpecs = legacy.tables?.product_specification_technical_dra || [];
      } catch (_) { /* ignore */ }
    }

    if (legacySpecs.length > 0) {
      for (const s of legacySpecs) {
        await dbRun(
          `INSERT OR IGNORE INTO product_specification_technical_dra
             (Maintains, database, closure, product, specifications, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.Maintains,
            s.database,
            s.closure,
            s.product,
            s.specifications,
            s.status || 'Active',
            s.created_at || new Date().toISOString(),
            s.updated_at || new Date().toISOString()
          ]
        );
      }
      console.log(`Migrated ${legacySpecs.length} specification(s) from database.json`);
    } else {
      // Built-in seed data
      const seedSpecs = [
        {
          Maintains: 'SV-CL-28MM', database: 'DRW-2026-001',
          closure: '28mm Beverage Cap', product: 'Carbonated Soft Drink Closure Blue',
          specifications: 'Material: HDPE, Outer Diameter: 28.2mm ± 0.05mm, Inner Seal: 24.8mm ± 0.02mm, Height: 15.2mm ± 0.03mm, Target Weight: 2.15g ± 0.05g, FDA Approved Food Grade.',
          status: 'Active'
        },
        {
          Maintains: 'SV-CL-38MM', database: 'DRW-2026-002',
          closure: '38mm Dairy Lid', product: 'Fresh Milk Bottle Closure White',
          specifications: 'Material: PP, Outer Diameter: 38.5mm ± 0.06mm, Inner Seal: 34.2mm ± 0.03mm, Height: 12.0mm ± 0.04mm, Target Weight: 3.10g ± 0.08g, FDA Approved Food Grade.',
          status: 'Active'
        },
        {
          Maintains: 'SV-CL-30MM', database: 'DRW-2026-003',
          closure: '30mm Water Cap', product: 'Mineral Water Cap Light Blue',
          specifications: 'Material: Organoleptic HDPE, Outer Diameter: 30.1mm ± 0.04mm, Height: 11.5mm ± 0.02mm, Target Weight: 1.65g ± 0.03g, FDA Approved Food Grade.',
          status: 'Archived'
        },
        {
          Maintains: 'SV-CL-20PH', database: 'DRW-2026-004',
          closure: '20mm Pharma Seal', product: 'Pharmaceutical Vial Seal Grey',
          specifications: 'Material: PP / Rubber Liner, Outer Diameter: 20.2mm ± 0.02mm, Height: 7.2mm ± 0.01mm, Target Weight: 0.95g ± 0.02g, USP Class VI Certified Grade.',
          status: 'Active'
        },
        {
          Maintains: 'SV-CL-45IND', database: 'DRW-2026-005',
          closure: '45mm Industrial Cap', product: 'Chemical Can Cap Red',
          specifications: 'Material: High-Density PP, Outer Diameter: 45.8mm ± 0.12mm, Height: 22.0mm ± 0.15mm, Target Weight: 7.50g ± 0.25g, Industrial Grade Chemical Resistant.',
          status: 'Archived'
        }
      ];

      for (const s of seedSpecs) {
        await dbRun(
          `INSERT OR IGNORE INTO product_specification_technical_dra
             (Maintains, database, closure, product, specifications, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [s.Maintains, s.database, s.closure, s.product, s.specifications, s.status]
        );
      }
      console.log('Seeded default product specifications.');
    }
  }

  console.log('Database initialisation complete.');
};

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initDatabase
};
