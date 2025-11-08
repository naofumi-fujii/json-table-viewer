'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import JsonTable from '@/components/JsonTable';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    } catch {
      setError('Invalid JSON format');
      setParsedData(null);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Limit width between 20% and 80%
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-screen">
      {/* Left side - JSON input */}
      <div style={{ width: `${leftWidth}%` }} className="p-4 flex-shrink-0">
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

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 ${
          isDragging ? 'bg-blue-500' : ''
        }`}
        style={{ userSelect: 'none' }}
      />

      {/* Right side - Table display */}
      <div className="flex-1 p-4 overflow-auto">
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
