'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Textarea,
  Heading,
  Text,
  IconButton,
  Link,
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight, FaGithub } from 'react-icons/fa';
import JsonTable from '@/components/JsonTable';
import ThemeToggleButton from '@/components/ThemeToggleButton';

// Sample JSON loaded on demand via the Sample button
const SAMPLE_JSON = `[
  { "name": "John", "age": 25, "city": "Tokyo", "website": "https://example.com" },
  { "name": "Jane", "age": 30, "city": "Osaka", "website": "https://example.org" },
  { "name": "Bob", "age": 28, "city": "Kyoto", "website": "https://example.net" }
]`;

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

  // Loads the sample JSON into the input and table
  const handleLoadSample = () => {
    setJsonInput(SAMPLE_JSON);
    setParsedData(JSON.parse(SAMPLE_JSON));
    setError('');
  };

  // Clears the JSON input and resets the table to the empty state
  const handleClear = () => {
    setJsonInput('');
    setParsedData(null);
    setError('');
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
    <Flex ref={containerRef} h="100vh" bg="bg">
      {/* Left side - JSON input (collapsed to narrow strip when hidden) */}
      <Box
        w={isInputVisible ? `${leftWidth}%` : '2rem'}
        flexShrink={0}
        transition="all 0.3s ease-in-out"
      >
        {isInputVisible ? (
          <Flex h="full" p={4} direction="column">
            <Flex align="center" justify="space-between" mb={4}>
              <Heading size="lg">JSON Input</Heading>
              <Flex align="center" gap={2}>
                <Button
                  onClick={handleLoadSample}
                  aria-label="Load sample JSON"
                  colorPalette="blue"
                  variant="subtle"
                  size="md"
                >
                  Sample
                </Button>
                <Button
                  onClick={handleClear}
                  aria-label="Clear JSON input"
                  colorPalette="gray"
                  variant="subtle"
                  size="md"
                  disabled={!jsonInput}
                >
                  Clear
                </Button>
                <IconButton
                  onClick={() => setIsInputVisible(false)}
                  aria-label="Hide JSON input"
                  colorPalette="blue"
                  variant="subtle"
                  size="md"
                >
                  <FaChevronLeft />
                </IconButton>
              </Flex>
            </Flex>
            <Textarea
              value={jsonInput}
              onChange={handleJsonChange}
              placeholder='Paste JSON here&#10;Example:&#10;[&#10;  {"name": "John", "age": 25, "city": "Tokyo"},&#10;  {"name": "Jane", "age": 30, "city": "Osaka"}&#10;]'
              flex={1}
              fontFamily="mono"
              fontSize="sm"
              resize="none"
              bg="bg.subtle"
            />
            {error && (
              <Text mt={2} color="fg.error" fontSize="sm">{error}</Text>
            )}
          </Flex>
        ) : (
          <Flex h="full" align="center" justify="center" bg="bg.muted" borderRight="1px" borderColor="border">
            <IconButton
              onClick={() => setIsInputVisible(true)}
              aria-label="Show JSON input"
              colorPalette="blue"
              variant="subtle"
              size="md"
              h={16}
            >
              <FaChevronRight />
            </IconButton>
          </Flex>
        )}
      </Box>

      {/* Resize handle - only visible when input is visible */}
      {isInputVisible && (
        <Box
          onMouseDown={handleMouseDown}
          w="4px"
          bg={isDragging ? 'blue.solid' : 'border'}
          _hover={{ bg: 'blue.solid' }}
          cursor="col-resize"
          flexShrink={0}
          userSelect="none"
        />
      )}

      {/* Right side - Table display */}
      <Box flex={1} p={4} overflow="auto">
        <Flex h="full" direction="column">
          <Flex align="center" justify="space-between" mb={4}>
            <Heading size="lg">
              Table View
              {parsedData !== null && (
                <Text as="span" ml={3} fontSize="md" fontWeight="normal" color="fg.muted">
                  ({Array.isArray(parsedData) ? parsedData.length : 1} {Array.isArray(parsedData) && parsedData.length !== 1 ? 'items' : 'item'})
                </Text>
              )}
            </Heading>
            <Flex align="center" gap={1}>
              <ThemeToggleButton />
              <Link
                href="https://github.com/naofumi-fujii/json-table-viewer"
                target="_blank"
                rel="noopener noreferrer"
                _hover={{ textDecoration: 'none' }}
              >
                <IconButton
                  aria-label="View on GitHub"
                  colorPalette="gray"
                  variant="ghost"
                  size="lg"
                >
                  <FaGithub size={24} />
                </IconButton>
              </Link>
            </Flex>
          </Flex>
          {parsedData ? (
            <JsonTable data={parsedData} />
          ) : (
            <Flex align="center" justify="center" h="full" color="fg.subtle">
              {isInputVisible ? 'Enter JSON on the left to display the table here' : 'Show the JSON input area and enter JSON'}
            </Flex>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}
