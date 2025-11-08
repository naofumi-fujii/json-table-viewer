'use client';

import { useState } from 'react';

interface JsonTableProps {
  data: unknown;
}

type SortDirection = 'asc' | 'desc' | null;

export default function JsonTable({ data }: JsonTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle different data types
  if (data === null || data === undefined) {
    return <div className="text-gray-500">データがありません</div>;
  }

  // If data is not an array, wrap it in an array
  const dataArray = Array.isArray(data) ? data : [data];

  // If array is empty
  if (dataArray.length === 0) {
    return <div className="text-gray-500">データが空です</div>;
  }

  // Extract all unique keys from all objects
  const keys = new Set<string>();
  dataArray.forEach((item) => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach((key) => keys.add(key));
    }
  });

  const columns = Array.from(keys);

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

  // Render value based on type
  const renderValue = (value: unknown): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Get raw value for sorting
  const getRawValue = (item: unknown, column: string): unknown => {
    if (typeof item === 'object' && item !== null) {
      return (item as Record<string, unknown>)[column];
    }
    return item;
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
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
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
    <div className="overflow-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
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
              {columns.map((column) => (
                <td
                  key={column}
                  className="border border-gray-300 px-4 py-2 text-gray-900"
                >
                  {typeof item === 'object' && item !== null
                    ? renderValue(item[column])
                    : rowIndex === 0 && column === columns[0]
                    ? renderValue(item)
                    : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
