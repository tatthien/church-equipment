import { Database } from 'bun:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../equipment.db');
export const db = new Database(dbPath, { create: true });

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    purchase_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'old', 'damaged', 'repairing', 'disposed')),
    department_id INTEGER,
    created_by INTEGER,
    brand_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: brands from equipment
try {
  // Check if brand_id column exists
  const tableInfo = db.query("PRAGMA table_info(equipment)").all() as any[];
  const hasBrandId = tableInfo.some(col => col.name === 'brand_id');

  if (!hasBrandId) {
    console.log('Migrating brands...');
    // Add brand_id column
    db.run('ALTER TABLE equipment ADD COLUMN brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL');
  }

  // Extract distinct brands and insert into brands table
  const distinctBrands = db.query('SELECT DISTINCT brand FROM equipment WHERE brand IS NOT NULL AND brand != ""').all() as { brand: string }[];

  for (const { brand } of distinctBrands) {
    db.run('INSERT OR IGNORE INTO brands (name) VALUES (?)', [brand]);
  }

  // Update equipment with brand_id
  db.run(`
     UPDATE equipment 
     SET brand_id = (SELECT id FROM brands WHERE brands.name = equipment.brand)
     WHERE brand IS NOT NULL AND brand_id IS NULL
   `);
  console.log('Brand migration completed.');

} catch (err) {
  console.error('Migration error:', err);
}

// Insert default departments if empty
const deptCount = db.query('SELECT COUNT(*) as count FROM departments').get() as { count: number };
if (deptCount.count === 0) {
  const insertDept = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)');
  insertDept.run('Âm thanh', 'Thiết bị âm thanh: loa, micro, mixer...');
  insertDept.run('Ban nhạc', 'Nhạc cụ: guitar, keyboard, trống...');
  insertDept.run('Ánh sáng', 'Thiết bị chiếu sáng: đèn sân khấu, LED...');
  insertDept.run('Văn phòng', 'Thiết bị văn phòng: máy in, máy chiếu...');
  insertDept.run('Khác', 'Các thiết bị khác');
}

export default db;
