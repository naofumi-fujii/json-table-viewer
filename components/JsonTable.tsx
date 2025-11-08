interface JsonTableProps {
  data: any;
}

export default function JsonTable({ data }: JsonTableProps) {
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
  const renderValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th
                key={column}
                className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataArray.map((item, rowIndex) => (
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
