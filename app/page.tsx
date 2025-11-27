'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Flex,
  Textarea,
  Heading,
  Text,
  IconButton,
  Link,
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight, FaGithub, FaMoon, FaSun } from 'react-icons/fa';
import JsonTable from '@/components/JsonTable';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [leftWidth, setLeftWidth] = useState(25); // Percentage (1:3 ratio)
  const [isDragging, setIsDragging] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  // Initialize color mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('colorMode');
    if (saved === 'dark' || saved === 'light') {
      setColorMode(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setColorMode('dark');
    }
  }, []);

  // Update localStorage when color mode changes
  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    localStorage.setItem('colorMode', newMode);
  };

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

  const bgColor = colorMode === 'light' ? 'white' : 'gray.900';
  const borderColor = colorMode === 'light' ? 'gray.300' : 'gray.600';
  const collapsedBg = colorMode === 'light' ? 'gray.100' : 'gray.800';
  const textColor = colorMode === 'light' ? 'gray.600' : 'gray.400';

  return (
    <Flex ref={containerRef} h="100vh" bg={bgColor}>
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
          <Flex h="full" align="center" justify="center" bg={collapsedBg} borderRight="1px" borderColor={borderColor}>
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
          bg={isDragging ? 'blue.500' : borderColor}
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
                <Text as="span" ml={3} fontSize="md" fontWeight="normal" color={textColor}>
                  ({Array.isArray(parsedData) ? parsedData.length : 1} {Array.isArray(parsedData) && parsedData.length !== 1 ? 'items' : 'item'})
                </Text>
              )}
            </Heading>
            <Flex gap={1}>
              <IconButton
                onClick={toggleColorMode}
                aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                colorScheme="gray"
                variant="ghost"
                size="lg"
              >
                {colorMode === 'light' ? <FaMoon size={20} /> : <FaSun size={20} />}
              </IconButton>
              <Link
                href="https://github.com/naofumi-fujii/json-table-viewer"
                target="_blank"
                rel="noopener noreferrer"
                _hover={{ textDecoration: 'none' }}
              >
                <IconButton
                  aria-label="View on GitHub"
                  colorScheme="gray"
                  variant="ghost"
                  size="lg"
                >
                  <FaGithub size={24} />
                </IconButton>
              </Link>
            </Flex>
          </Flex>
          {parsedData ? (
            <JsonTable data={parsedData} colorMode={colorMode} />
          ) : (
            <Flex align="center" justify="center" h="full" color={textColor}>
              {isInputVisible ? 'Enter JSON on the left to display the table here' : 'Show the JSON input area and enter JSON'}
            </Flex>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}
