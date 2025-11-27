'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  Link,
  Icon,
} from '@chakra-ui/react';
import { FaChevronUp, FaChevronDown, FaCaretUp, FaCaretDown } from 'react-icons/fa';

interface JsonTableProps {
  data: unknown;
  colorMode?: 'light' | 'dark';
}

type SortDirection = 'asc' | 'desc' | null;

export default function JsonTable({ data, colorMode = 'light' }: JsonTableProps) {
  // Prepare data before hooks
  const dataArray = useMemo(() => {
    return Array.isArray(data) ? data : data === null || data === undefined ? [] : [data];
  }, [data]);

  // Extract all unique keys from all objects
  const columns = useMemo(() => {
    const keys = new Set<string>();
    dataArray.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach((key) => keys.add(key));
      }
    });
    return Array.from(keys);
  }, [dataArray]);

  // All hooks must come before any conditional returns
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // Color mode dependent styles
  const isDark = colorMode === 'dark';
  const textColor = isDark ? 'gray.100' : 'gray.900';
  const textMuted = isDark ? 'gray.400' : 'gray.500';
  const textSecondary = isDark ? 'gray.300' : 'gray.700';
  const borderColor = isDark ? 'gray.600' : 'gray.300';
  const bgSubtle = isDark ? 'gray.800' : 'gray.50';
  const bgHeader = isDark ? 'gray.700' : 'gray.100';
  const bgHover = isDark ? 'gray.700' : 'gray.100';
  const bgHoverHeader = isDark ? 'gray.600' : 'gray.200';
  const bgRowEven = isDark ? 'gray.900' : 'white';
  const bgRowOdd = isDark ? 'gray.800' : 'gray.50';
  const linkColor = isDark ? 'blue.400' : 'blue.600';
  const linkHoverColor = isDark ? 'blue.300' : 'blue.800';

  // Calculate visible columns based on all columns and hidden columns
  const visibleColumns = useMemo(() => {
    const visible = new Set(columns);
    hiddenColumns.forEach(col => visible.delete(col));
    return visible;
  }, [columns, hiddenColumns]);

  // Now handle conditional returns after all hooks
  if (data === null || data === undefined) {
    return <Text color={textMuted}>No data available</Text>;
  }

  // If array is empty
  if (dataArray.length === 0) {
    return <Text color={textMuted}>Data is empty</Text>;
  }

  // Toggle column visibility
  const toggleColumn = (column: string) => {
    setHiddenColumns((prev) => {
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
    setHiddenColumns(visible ? new Set() : new Set(columns));
  };

  // Filter columns to only visible ones
  const displayColumns = columns.filter((col) => visibleColumns.has(col));

  // If no keys found, display raw JSON
  if (columns.length === 0) {
    return (
      <Box p={4} bg={bgSubtle} borderRadius="lg">
        <Text as="pre" fontSize="sm" overflow="auto" color={textColor}>
          {JSON.stringify(data, null, 2)}
        </Text>
      </Box>
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
        <Link
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          color={linkColor}
          _hover={{ color: linkHoverColor }}
          textDecoration="underline"
          onClick={(e) => e.stopPropagation()}
        >
          {String(value)}
        </Link>
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
      return <Text as="span" ml={1} color={textMuted}>⇅</Text>;
    }
    if (sortDirection === 'asc') {
      return <Icon as={FaCaretUp} ml={1} />;
    }
    if (sortDirection === 'desc') {
      return <Icon as={FaCaretDown} ml={1} />;
    }
    return null;
  };

  return (
    <Flex direction="column" h="full">
      {/* Column visibility settings */}
      <Box mb={4}>
        <Flex gap={2} align="center">
          <Button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            colorScheme="gray"
            size="sm"
            fontWeight="medium"
            title={showColumnSettings ? 'Hide column settings' : 'Show column settings'}
          >
            <Flex align="center" gap={2}>
              <Text fontSize="lg">☰</Text>
              <Text fontSize="base">{visibleColumns.size}/{columns.length}</Text>
              <Icon as={showColumnSettings ? FaChevronUp : FaChevronDown} />
            </Flex>
          </Button>
        </Flex>

        {showColumnSettings && (
          <Box mt={2} p={4} bg={bgSubtle} border="1px" borderColor={borderColor} borderRadius="lg">
            <Flex align="center" justify="space-between" mb={3}>
              <Flex align="center" gap={2} fontWeight="semibold" color={textSecondary}>
                <Text fontSize="lg">▦</Text>
                <Text fontSize="sm">{visibleColumns.size}/{columns.length}</Text>
              </Flex>
              <Flex gap={2}>
                <Button
                  onClick={() => toggleAllColumns(true)}
                  colorScheme="blue"
                  size="sm"
                  w={10}
                  h={10}
                  title="Show all columns"
                >
                  <Text fontSize="xl">☑</Text>
                </Button>
                <Button
                  onClick={() => toggleAllColumns(false)}
                  colorScheme="gray"
                  size="sm"
                  w={10}
                  h={10}
                  title="Hide all columns"
                >
                  <Text fontSize="xl">☐</Text>
                </Button>
              </Flex>
            </Flex>
            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }} gap={2}>
              {columns.map((column) => (
                <Box
                  key={column}
                  p={2}
                  _hover={{ bg: bgHover }}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => toggleColumn(column)}
                >
                  <Flex align="center" gap={2}>
                    <input
                      type="checkbox"
                      checked={!hiddenColumns.has(column)}
                      onChange={() => toggleColumn(column)}
                      style={{ cursor: 'pointer' }}
                    />
                    <Text fontSize="sm" color={textSecondary}>{column}</Text>
                  </Flex>
                </Box>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Table */}
      <Box overflow="auto" flex={1}>
        <Box
          as="table"
          w="full"
          borderCollapse="collapse"
          border="1px"
          borderColor={borderColor}
        >
          <Box as="thead">
            <Box as="tr" bg={bgHeader}>
              {displayColumns.map((column) => (
                <Box
                  as="th"
                  key={column}
                  onClick={() => handleSort(column)}
                  cursor="pointer"
                  _hover={{ bg: bgHoverHeader }}
                  userSelect="none"
                  border="1px"
                  borderColor={borderColor}
                  px={4}
                  py={2}
                  textAlign="left"
                  fontWeight="semibold"
                  color={textSecondary}
                >
                  {column}
                  {renderSortIndicator(column)}
                </Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {sortedDataArray.map((item, rowIndex) => (
              <Box
                as="tr"
                key={rowIndex}
                bg={rowIndex % 2 === 0 ? bgRowEven : bgRowOdd}
              >
                {displayColumns.map((column) => (
                  <Box
                    as="td"
                    key={column}
                    border="1px"
                    borderColor={borderColor}
                    px={4}
                    py={2}
                    color={textColor}
                  >
                    {typeof item === 'object' && item !== null
                      ? renderValue(item[column])
                      : rowIndex === 0 && column === displayColumns[0]
                      ? renderValue(item)
                      : ''}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
