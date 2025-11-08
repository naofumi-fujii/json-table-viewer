'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Flex,
  Textarea,
  Heading,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
    <Flex ref={containerRef} h="100vh">
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
              <IconButton
                onClick={() => setIsInputVisible(false)}
                aria-label="Hide JSON input"
                colorScheme="blue"
                size="md"
              >
                <FaChevronLeft />
              </IconButton>
            </Flex>
            <Textarea
              value={jsonInput}
              onChange={handleJsonChange}
              placeholder='Paste JSON here&#10;Example:&#10;[&#10;  {"name": "John", "age": 25, "city": "Tokyo"},&#10;  {"name": "Jane", "age": 30, "city": "Osaka"}&#10;]'
              flex={1}
              fontFamily="mono"
              fontSize="sm"
              resize="none"
            />
            {error && (
              <Text mt={2} color="red.600" fontSize="sm">{error}</Text>
            )}
          </Flex>
        ) : (
          <Flex h="full" align="center" justify="center" bg="gray.100" borderRight="1px" borderColor="gray.300">
            <IconButton
              onClick={() => setIsInputVisible(true)}
              aria-label="Show JSON input"
              colorScheme="blue"
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
          bg={isDragging ? 'blue.500' : 'gray.300'}
          _hover={{ bg: 'blue.500' }}
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
                <Text as="span" ml={3} fontSize="md" fontWeight="normal" color="gray.600">
                  ({Array.isArray(parsedData) ? parsedData.length : 1} {Array.isArray(parsedData) && parsedData.length !== 1 ? 'items' : 'item'})
                </Text>
              )}
            </Heading>
          </Flex>
          {parsedData ? (
            <JsonTable data={parsedData} />
          ) : (
            <Flex align="center" justify="center" h="full" color="gray.400">
              {isInputVisible ? 'Enter JSON on the left to display the table here' : 'Show the JSON input area and enter JSON'}
            </Flex>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}
