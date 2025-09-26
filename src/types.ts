export type ProjectType = 'document' | 'slides';

export interface Project {
  id: number;
  name: string;
  type: ProjectType;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TableInfo {
  name: string;
}

export interface TableSchema {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface TableStats {
  rowCount: number;
}

export interface ElectronAPI {
  projects: {
    getAll: () => Promise<Project[]>;
    create: (name: string, type: ProjectType, description?: string) => Promise<Project>;
    get: (id: number) => Promise<Project>;
  };
  db: {
    getTables: () => Promise<TableInfo[]>;
    getTableData: (tableName: string) => Promise<any[]>;
    getTableSchema: (tableName: string) => Promise<TableSchema[]>;
    getTableStats: (tableName: string) => Promise<TableStats>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}