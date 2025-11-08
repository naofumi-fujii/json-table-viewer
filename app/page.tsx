'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import JsonTable from '@/components/JsonTable';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [leftWidth, setLeftWidth] = useState(25); // Percentage (1:3 ratio)
  const [isDragging, setIsDragging] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
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
      {/* Left side - JSON input (collapsed to narrow strip when hidden) */}
      <div
        style={{ width: isInputVisible ? `${leftWidth}%` : '2rem' }}
        className="flex-shrink-0 transition-all duration-300 ease-in-out"
      >
        {isInputVisible ? (
          <div className="h-full p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">JSON Input</h2>
              <button
                onClick={() => setIsInputVisible(false)}
                className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Hide JSON input"
              >
                <span className="text-xl">←</span>
              </button>
            </div>
            <textarea
              value={jsonInput}
              onChange={handleJsonChange}
              placeholder='Paste JSON here&#10;Example:&#10;[&#10;  {"name": "John", "age": 25, "city": "Tokyo"},&#10;  {"name": "Jane", "age": 30, "city": "Osaka"}&#10;]'
              className="flex-1 w-full p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && (
              <div className="mt-2 text-red-600 text-sm">{error}</div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100 border-r border-gray-300">
            <button
              onClick={() => setIsInputVisible(true)}
              className="w-8 h-16 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Show JSON input"
            >
              <span className="text-xl">→</span>
            </button>
          </div>
        )}
      </div>

      {/* Resize handle - only visible when input is visible */}
      {isInputVisible && (
        <div
          onMouseDown={handleMouseDown}
          className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 ${
            isDragging ? 'bg-blue-500' : ''
          }`}
          style={{ userSelect: 'none' }}
        />
      )}

      {/* Right side - Table display */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              Table View
              {parsedData && (
                <span className="ml-3 text-base font-normal text-gray-600">
                  ({Array.isArray(parsedData) ? parsedData.length : 1} {Array.isArray(parsedData) && parsedData.length !== 1 ? 'items' : 'item'})
                </span>
              )}
            </h2>
          </div>
          {parsedData ? (
            <JsonTable data={parsedData} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {isInputVisible ? 'Enter JSON on the left to display the table here' : 'Show the JSON input area and enter JSON'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
