const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  projects: {
    getAll: () => ipcRenderer.invoke('projects:getAll'),
    create: (name, type, description) => ipcRenderer.invoke('projects:create', name, type, description),
    get: (id) => ipcRenderer.invoke('projects:get', id),
  },
  db: {
    getTables: () => ipcRenderer.invoke('db:getTables'),
    getTableData: (tableName) => ipcRenderer.invoke('db:getTableData', tableName),
    getTableSchema: (tableName) => ipcRenderer.invoke('db:getTableSchema', tableName),
    getTableStats: (tableName) => ipcRenderer.invoke('db:getTableStats', tableName),
  }
});