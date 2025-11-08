'use client';

import { useState, useEffect } from 'react';

interface JsonTableProps {
  data: unknown;
}

type SortDirection = 'asc' | 'desc' | null;

export default function JsonTable({ data }: JsonTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Handle different data types
  if (data === null || data === undefined) {
    return <div className="text-gray-500">No data available</div>;
  }

  // If data is not an array, wrap it in an array
  const dataArray = Array.isArray(data) ? data : [data];

  // If array is empty
  if (dataArray.length === 0) {
    return <div className="text-gray-500">Data is empty</div>;
  }

  // Extract all unique keys from all objects
  const keys = new Set<string>();
  dataArray.forEach((item) => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach((key) => keys.add(key));
    }
  });

  const columns = Array.from(keys);

  // Initialize visible columns when columns change
  useEffect(() => {
    setVisibleColumns(new Set(columns));
  }, [columns.join(',')]);

  // Toggle column visibility
  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  // Toggle all columns
  const toggleAllColumns = (visible: boolean) => {
    setVisibleColumns(visible ? new Set(columns) : new Set());
  };

  // Filter columns to only visible ones
  const displayColumns = columns.filter((col) => visibleColumns.has(col));

  // If no keys found, display raw JSON
  if (columns.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  // Check if a value is a URL
  const isURL = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Render value based on type
  const renderValue = (value: unknown): JSX.Element | string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);

    // Check if value is a URL
    if (isURL(value)) {
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
          onClick={(e) => e.stopPropagation()}
        >
          {String(value)}
        </a>
      );
    }

    return String(value);
  };

  // Get raw value for sorting
  const getRawValue = (item: unknown, column: string): unknown => {
    if (typeof item === 'object' && item !== null) {
      return (item as Record<string, unknown>)[column];
    }
    return item;
  };

  // Check if a value is numeric (number type or numeric string)
  const isNumeric = (val: unknown): boolean => {
    if (typeof val === 'number') return !isNaN(val);
    if (typeof val === 'string') {
      const trimmed = val.trim();
      return trimmed !== '' && !isNaN(Number(trimmed));
    }
    return false;
  };

  // Handle column header click for sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort the data array
  const sortedDataArray = [...dataArray];
  if (sortColumn && sortDirection) {
    sortedDataArray.sort((a, b) => {
      const aVal = getRawValue(a, sortColumn);
      const bVal = getRawValue(b, sortColumn);

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Compare values
      let comparison = 0;
      // Check if both values are numeric (including numeric strings)
      if (isNumeric(aVal) && isNumeric(bVal)) {
        comparison = Number(aVal) - Number(bVal);
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else {
        // Convert to string for comparison
        const aStr = String(aVal);
        const bStr = String(bVal);
        comparison = aStr.localeCompare(bStr);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    if (sortDirection === 'asc') {
      return <span className="ml-1">▲</span>;
    }
    if (sortDirection === 'desc') {
      return <span className="ml-1">▼</span>;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column visibility settings */}
      <div className="mb-4">
        <button
          onClick={() => setShowColumnSettings(!showColumnSettings)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          {showColumnSettings ? 'Hide' : 'Show'} Column Settings
        </button>

        {showColumnSettings && (
          <div className="mt-2 p-4 bg-gray-50 border border-gray-300 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">Visible Columns</h3>
              <div className="space-x-2">
                <button
                  onClick={() => toggleAllColumns(true)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                >
                  Show All
                </button>
                <button
                  onClick={() => toggleAllColumns(false)}
                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  Hide All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {columns.map((column) => (
                <label
                  key={column}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(column)}
                    onChange={() => toggleColumn(column)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{column}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {displayColumns.map((column) => (
              <th
                key={column}
                onClick={() => handleSort(column)}
                className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
              >
                {column}
                {renderSortIndicator(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedDataArray.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {displayColumns.map((column) => (
                <td
                  key={column}
                  className="border border-gray-300 px-4 py-2 text-gray-900"
                >
                  {typeof item === 'object' && item !== null
                    ? renderValue(item[column])
                    : rowIndex === 0 && column === displayColumns[0]
                    ? renderValue(item)
                    : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
