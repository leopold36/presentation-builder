import React, { useState, useEffect } from 'react';
import { TableInfo, TableSchema, TableStats } from '../types';

interface DatabaseViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DatabaseViewer: React.FC<DatabaseViewerProps> = ({ isOpen, onClose }) => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableSchema, setTableSchema] = useState<TableSchema[]>([]);
  const [tableStats, setTableStats] = useState<TableStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTables();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  const loadTables = async () => {
    try {
      setIsLoading(true);
      const tablesData = await window.electronAPI.db.getTables();
      setTables(tablesData);
      if (tablesData.length > 0) {
        setSelectedTable(tablesData[0].name);
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTableData = async (tableName: string) => {
    try {
      setIsLoading(true);
      const [data, schema, stats] = await Promise.all([
        window.electronAPI.db.getTableData(tableName),
        window.electronAPI.db.getTableSchema(tableName),
        window.electronAPI.db.getTableStats(tableName)
      ]);

      setTableData(data);
      setTableSchema(schema);
      setTableStats(stats);
    } catch (error) {
      console.error('Failed to load table data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatValue = (value: any) => {
    if (value === null) return <span className="text-gray-400 italic">null</span>;
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Database Viewer</h2>
            {tables.length > 0 && (
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {tables.map((table) => (
                  <option key={table.name} value={table.name}>
                    {table.name}
                  </option>
                ))}
              </select>
            )}
            {tableStats && (
              <span className="text-sm text-gray-600">
                {tableStats.rowCount} rows
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : tableData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 mb-2">No data</div>
                <div className="text-sm text-gray-500">Table is empty</div>
              </div>
            </div>
          ) : (
            <div className="overflow-auto h-full">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    {tableSchema.map((column) => (
                      <th
                        key={column.name}
                        className="text-left px-3 py-2 font-medium text-gray-700 border-b border-gray-200"
                      >
                        <div className="flex flex-col">
                          <span>{column.name}</span>
                          <span className="text-xs text-gray-500 font-normal">
                            {column.type}
                            {column.pk ? ' (PK)' : ''}
                            {column.notnull ? ' NOT NULL' : ''}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      {tableSchema.map((column) => (
                        <td
                          key={column.name}
                          className="px-3 py-2 text-gray-900 border-r border-gray-100"
                        >
                          {formatValue(row[column.name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;