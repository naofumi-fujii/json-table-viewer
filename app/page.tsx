'use client';

import { useState } from 'react';
import JsonTable from '@/components/JsonTable';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);

    if (!value.trim()) {
      setParsedData(null);
      setError('');
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setParsedData(parsed);
      setError('');
    } catch (err) {
      setError('Invalid JSON format');
      setParsedData(null);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - JSON input */}
      <div className="w-1/2 p-4 border-r border-gray-300">
        <div className="h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4">JSON入力</h2>
          <textarea
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder='JSONを貼り付けてください&#10;例:&#10;[&#10;  {"name": "太郎", "age": 25, "city": "東京"},&#10;  {"name": "花子", "age": 30, "city": "大阪"}&#10;]'
            className="flex-1 w-full p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && (
            <div className="mt-2 text-red-600 text-sm">{error}</div>
          )}
        </div>
      </div>

      {/* Right side - Table display */}
      <div className="w-1/2 p-4 overflow-auto">
        <div className="h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4">テーブル表示</h2>
          {parsedData ? (
            <JsonTable data={parsedData} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              左側にJSONを入力すると、ここにテーブルが表示されます
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
