const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    this.db = null;
  }

  init() {
    try {
      const dbPath = path.join(app.getPath('userData'), 'presentation-builder.db');
      this.db = new Database(dbPath);

      // Create table with initial schema
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Run migrations
      this.runMigrations();

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  runMigrations() {
    try {
      // Check if table structure needs to be reset
      const columns = this.db.prepare("PRAGMA table_info(projects)").all();
      const columnNames = columns.map(col => col.name);

      // Check for unexpected columns or missing expected ones
      const expectedColumns = ['id', 'name', 'type', 'description', 'created_at', 'updated_at'];
      const hasUnexpectedColumns = columnNames.some(col => !expectedColumns.includes(col) && col !== 'type');
      const hasTemplateId = columnNames.includes('template_id');

      if (hasTemplateId || hasUnexpectedColumns) {
        console.log('Detected incompatible schema, recreating projects table...');

        // Backup existing data if possible
        try {
          const existingData = this.db.prepare("SELECT * FROM projects").all();

          // Drop the old table
          this.db.exec("DROP TABLE IF EXISTS projects");

          // Create new table with correct schema
          this.db.exec(`
            CREATE TABLE projects (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              type TEXT NOT NULL DEFAULT 'document' CHECK(type IN ('document', 'slides')),
              description TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);

          // Try to restore compatible data
          if (existingData.length > 0) {
            const stmt = this.db.prepare(`
              INSERT INTO projects (name, type, description, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?)
            `);

            for (const row of existingData) {
              try {
                stmt.run(
                  row.name || 'Untitled',
                  row.type || 'document',
                  row.description || '',
                  row.created_at || new Date().toISOString(),
                  row.updated_at || new Date().toISOString()
                );
              } catch (e) {
                console.log('Could not restore row:', row);
              }
            }
          }

          console.log('Table recreated successfully');
        } catch (e) {
          // If backup fails, just recreate empty table
          this.db.exec("DROP TABLE IF EXISTS projects");
          this.db.exec(`
            CREATE TABLE projects (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              type TEXT NOT NULL DEFAULT 'document' CHECK(type IN ('document', 'slides')),
              description TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log('Table recreated (without data restoration)');
        }
      } else if (!columnNames.includes('type')) {
        console.log('Running migration: Adding type column to projects table');

        // Add the type column with a default value
        this.db.exec(`
          ALTER TABLE projects
          ADD COLUMN type TEXT NOT NULL DEFAULT 'document'
          CHECK(type IN ('document', 'slides'))
        `);

        console.log('Migration completed: type column added');
      }
    } catch (error) {
      console.error('Failed to run migrations:', error);
      throw error;
    }
  }

  createProject(name, type, description = '') {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO projects (name, type, description, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `);
      const result = stmt.run(name, type, description);
      return this.getProject(result.lastInsertRowid);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  getProjects() {
    try {
      const stmt = this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }
  }

  getProject(id) {
    try {
      const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
      return stmt.get(id);
    } catch (error) {
      console.error('Failed to get project:', error);
      throw error;
    }
  }

  getTables() {
    try {
      const stmt = this.db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);
      return stmt.all();
    } catch (error) {
      console.error('Failed to get tables:', error);
      throw error;
    }
  }

  getTableData(tableName) {
    try {
      const stmt = this.db.prepare(`SELECT * FROM ${tableName} ORDER BY id DESC`);
      return stmt.all();
    } catch (error) {
      console.error('Failed to get table data:', error);
      throw error;
    }
  }

  getTableSchema(tableName) {
    try {
      const stmt = this.db.prepare(`PRAGMA table_info(${tableName})`);
      return stmt.all();
    } catch (error) {
      console.error('Failed to get table schema:', error);
      throw error;
    }
  }

  getTableStats(tableName) {
    try {
      const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
      const result = countStmt.get();
      return { rowCount: result.count };
    } catch (error) {
      console.error('Failed to get table stats:', error);
      throw error;
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = new DatabaseManager();